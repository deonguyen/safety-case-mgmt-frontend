"use server";

import { cookies } from "next/headers";
import { GithubReleaseModel } from "../types/github-release-model";

const SPEC_API_HOST = process.env.SPEC_API_HOST;
export async function getGithubReleases(
  page?: number,
  pageSize?: number,
): Promise<{
  releases?: GithubReleaseModel[];
  count?: number;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (pageSize) params.append("page_size", pageSize.toString());
  const queryString = params.toString();
  const url = queryString
    ? `${SPEC_API_HOST}/spec/github/get_github_releases/?${queryString}`
    : `${SPEC_API_HOST}/spec/github/get_github_releases/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Failed to fetch functions.", status: response.status };
    }
    const data = await response.json();
    if (data.results) {
      return { releases: data.results, count: data.count, status: 200 };
    }
    return { releases: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}
