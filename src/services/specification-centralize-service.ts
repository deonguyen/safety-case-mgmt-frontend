"use server";

import { cookies } from "next/headers";

const SPEC_API_HOST = process.env.SPEC_API_HOST;

export async function saveProjectSpecificationMilestoneBaseline(
  milestoneId: number,
  projectId: number,
  userId: number,
  version: string,
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { error: "Unauthorized", status: 401 };
    }

    const projectIdFromCookie = cookieStore.get("project_id")?.value;
    const userIdFromCookie = cookieStore.get("user_id")?.value;

    const postData = {
      project_id: projectIdFromCookie ?? projectId,
      project_milestone_id: milestoneId,
      user_id: userIdFromCookie ?? userId,
      version: version,
    };
    console.log("postData:", postData);
    const response = await fetch(
      `${SPEC_API_HOST}/spec/project-specification-milestone-baselines/projectspecificationmilestonebaseline/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(postData),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response from API:", errorData);
      return {
        error:
          errorData.detail ||
          "Failed to save project specification milestone baseline.",
        status: response.status,
      };
    }
    return { data: await response.json(), success: true, status: 200 };
  } catch (error) {
    console.error("Error in saveProjectSpecificationMilestoneBaseline:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}
