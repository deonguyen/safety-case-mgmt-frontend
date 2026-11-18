"use server";

import { ProjectSettingsModel } from "@/src/types/project-settings-model";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

export async function getProjectSettings(projectId: number): Promise<{
  projectSettings?: ProjectSettingsModel;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!projectId) {
    return { error: "Project ID is required", status: 400 };
  }

  try {
    const response = await fetch(
      `${DJANGO_API_HOST}/spec/project-settings/?project_id=${projectId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { projectSettings: undefined, status: 404 };
      }
      return {
        error: "Failed to fetch project settings.",
        status: response.status,
      };
    }

    const data = await response.json();
    return { projectSettings: data, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function createOrUpdateProjectSettings(
  projectSettingsData: Partial<ProjectSettingsModel>,
): Promise<{
  projectSettings?: ProjectSettingsModel;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  const { id, ...data } = projectSettingsData;

  try {
    let response;
    if (id && projectSettingsData.project_id) {
      // Update existing settings
      response = await fetch(
        `${DJANGO_API_HOST}/spec/project-settings/${id}/`,
        {
          method: "PATCH", // Using PATCH to partially update
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        },
      );
    } else {
      // Create new settings
      response = await fetch(`${DJANGO_API_HOST}/spec/project-settings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error:
          errorData.detail || "Failed to save project settings.",
        status: response.status,
      };
    }

    revalidatePath("/settings/project");
    const projectSettings = await response.json();
    return { projectSettings, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}