"use server";

import { cookies } from "next/headers";
import {
  ProjectSpecificationMilestoneBaselinePaginatedResponse,
  MilestoneData,
} from "@/src/types/project-specification-milestone-baseline-query-model";

const SPEC_API_HOST = process.env.SPEC_API_HOST;

export async function getProjectSpecificationMilestoneBaselines(
projectId: number, page?: number, pageSize?: number, filterCategory1?: string, filterComponent?: string, filterFunction?: string, filterSpecificationName?: string, filterSpecificationType?: string, filterVersion?: string, filterSpecSource?: string,
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { error: "Unauthorized", status: 401 };
    }

    const params = new URLSearchParams();
    if (projectId) params.append("project_id", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    if (filterSpecSource) params.append("specification_source", filterSpecSource);
    if (filterCategory1) params.append("category1", filterCategory1);
    if (filterComponent) params.append("component_name", filterComponent);
    if (filterFunction) params.append("function_name", filterFunction);
    if (filterSpecificationName)
      params.append("specification_name", filterSpecificationName);
    if (filterSpecificationType)
      params.append("specification_type", filterSpecificationType);
    if (filterVersion) params.append("specification_version", filterVersion);

    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/project-specification-milestone-baselines/getprojectspecificationmilestonebaselinebysql/?${queryString}`
      : `${SPEC_API_HOST}/spec/project-specification-milestone-baselines/getprojectspecificationmilestonebaselinebysql/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        error: "Failed to fetch project specifications.",
        status: response.status,
      };
    }
    const data = await response.json();
    const resultResponse: ProjectSpecificationMilestoneBaselinePaginatedResponse =
      {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results.map((item: any) => {
          return {
            ...item,
            milestones:
              typeof item.milestones === "string"
                ? (JSON.parse(item.milestones) as Record<string, MilestoneData>)
                : (item.milestones as Record<string, MilestoneData> | null),
          };
        }),
      };
    return resultResponse;
  } catch (error) {
    console.error("Error in getProjectSpecificationMilestoneBaseline:", error);
    throw error;
  }
}

export async function updateProjectSpecificationMilestoneBaselineVerion(
  projectId: number,
  projectSpecificationId: number,
  milestoneId: number,
  version: string,
): Promise<{ message?: string; error?: string; status?: number }> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const url = `${SPEC_API_HOST}/spec/project-specification-milestone-baselines/update_project_specification_milestone_baseline_version/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        project_specification_id: projectSpecificationId,
        milestone_id: milestoneId,
        version: version,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        error:
          "Failed to update project specification milestone baseline version.",
        status: response.status,
      };
    }
    const data = await response.json();
    return { message: data.message, status: 200 };
  } catch (error) {
    console.error("Error in getProjectSpecificationMilestoneBaseline:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}
