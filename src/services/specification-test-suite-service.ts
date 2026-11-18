"use server";

import { cookies } from "next/headers";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

export async function getSpecificationTestSuites(
  projectId: number,
  specificationId: number,
  specificationRevisionId: number,
  milestoneId?: number,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const params = new URLSearchParams();
    params.append("project_id", projectId.toString());
    params.append("specification_id", specificationId.toString());
    params.append(
      "specification_revision_id",
      specificationRevisionId.toString(),
    );
    if (milestoneId) params.append("milestone_id", milestoneId.toString());

    const url = `${DJANGO_API_HOST}/spec/specification-test-suites/?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specification test suites.",
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function getSpecificationTestSuitesBySql(
  projectId: number,
  page: number,
  pageSize: number,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const params = new URLSearchParams();
    params.append("project_id", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());

    const url = `${DJANGO_API_HOST}/spec/specification-test-suites/project_specification_test_suites/?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specification test suites.",
        status: response.status,
      };
    }

    const data = await response.json();
    if (data.results) {
      return { results: data.results, count: data.count, status: 200 };
    }
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}
