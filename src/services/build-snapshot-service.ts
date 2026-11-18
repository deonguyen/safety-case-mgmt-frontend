/**
 * @file This module contains server-side actions for build-snapshot-related operations.
 */
"use server";

import { ProjectCodeBuildSnapshotModel } from "@/src/types/project-code-build-snapshot-model";
import { cookies } from "next/headers";

const SNAPSHOT_API_HOST = process.env.SNAPSHOT_API_HOST;

/**
 * Retrieves the project code build snapshots from the Django backend.
 * @returns A promise that resolves to the user settings or an error message.
 */
export async function getProjectCodeBuildSnapshots(
  projectId: number,
  page?: number,
  pageSize?: number,
): Promise<{
  snapshots?: ProjectCodeBuildSnapshotModel[];
  count?: number;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const params = new URLSearchParams();
    params.append("project_id", String(projectId));
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());

    const response = await fetch(
      `${SNAPSHOT_API_HOST}/snapshot/project-code-build-snapshots/?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!response.ok) return { error: "Failed to fetch build snapshots", status: response.status };
    
    const data = await response.json();
    if (data.results) {
      return { snapshots: data.results, count: data.count, status: 200 };
    }
    return { snapshots: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}