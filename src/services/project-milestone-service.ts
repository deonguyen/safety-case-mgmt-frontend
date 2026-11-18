"use server";

import { ProjectMilestoneModel } from "@/src/types/project-milestone-model";
import { cookies } from "next/headers";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

/**
 * Fetches a single project milestone by its ID.
 * @param id The ID of the project milestone to fetch.
 * @returns A promise that resolves to the ProjectMilestoneModel or an error.
 */
export async function getProjectMilestoneById(id: number): Promise<{
  projectMilestone?: ProjectMilestoneModel;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(
      `${DJANGO_API_HOST}/spec/project-milestones/${id}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return { error: `Failed to fetch project milestone ${id}.`, status: response.status };
    }
    const data = await response.json();
    const projectMilestone: ProjectMilestoneModel = {
      ...data,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
    };
    return { projectMilestone, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

/**
 * Fetches all project milestones for a given project.
 * @param projectId The ID of the project.
 * @param page The page number to fetch.
 * @param pageSize The number of items per page.
 * @returns A promise that resolves to an array of ProjectMilestoneModel or an error.
 */
export async function getProjectMilestones(
  projectId: number,
  page?: number,
  pageSize?: number,
): Promise<{
  projectMilestones?: ProjectMilestoneModel[];
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
    params.append("project", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());

    const queryString = params.toString();
    const url = queryString
    ? `${DJANGO_API_HOST}/spec/project-milestones/?${queryString}`
    : `${DJANGO_API_HOST}/spec/project-milestones/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Failed to fetch project milestones.", status: response.status };
    }
    const data = await response.json();

    const milestones = data.results ? data.results : data;

    if (data.results) {
      return { projectMilestones: milestones, count: data.count, status: 200 };
    }
    return { projectMilestones: milestones, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getProjectMilestoneTotalRow(): Promise<{
  totalRow?: number;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(
      `${DJANGO_API_HOST}/spec/project-milestones/count`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return { error: "Failed to fetch project milestone count.", status: response.status };
    }
    const data = await response.json();
    return { totalRow: data.count, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}
