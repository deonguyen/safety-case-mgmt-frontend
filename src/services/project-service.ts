/**
 * @file This module handles server-side actions for fetching and creating projects.
 * It communicates with the Django API backend and manages access tokens.
 */
"use server";

import { ProjectModel } from "@/src/types/project-model";
import { cookies } from "next/headers";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

/**
 * Fetches a paginated list of projects.
 * @param page The page number to fetch.
 * @param pageSize The number of projects per page.
 * @returns A promise that resolves to a list of projects, the total count, or an error.
 */
export async function getProjects(page?: number, pageSize?: number): Promise<{
  projects?: ProjectModel[];
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
    // 1. Construct the query parameters for pagination.
    const params = new URLSearchParams();
    if (page) {
      params.append("page", page.toString());
      params.append("page_size", (pageSize || 25).toString());
    } else if (pageSize) {
      params.append("page_size", pageSize.toString());
    }
    const queryString = params.toString();
    const url = queryString
      ? `${DJANGO_API_HOST}/spec/projects/?${queryString}`
      : `${DJANGO_API_HOST}/spec/projects/`;

    // 2. Fetch the projects from the API.
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    // 3. Handle unsuccessful responses.
    if (!response.ok) {
      return { error: "Failed to fetch projects.", status: response.status };
    }
    const data = await response.json();

    // 4. Parse the paginated results or return the array directly.
    if (data.results) {
      return { projects: data.results, count: data.count, status: 200 };
    }
    return { projects: data, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

/**
 * Creates a new project.
 * @param formData The form data containing project details (name, code, description).
 * @returns An object containing an error message if the creation fails, otherwise redirects.
 */
export async function createProject(formData: FormData) {
  const name = formData.get("name");
  const code = formData.get("code");
  const description = formData.get("description");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // 1. Send a POST request to create the project.
    const response = await fetch(`${DJANGO_API_HOST}/spec/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        code,
        description,
        owner: 1, // Default owner ID for demo purposes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });

    // 2. Handle API errors during creation.
    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.detail || "Failed to create project", status: response.status };
    }
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred. Please try again.", status: 500 };
  }

  // 3. Return a successful response.
  return { success: true, message: "Project created successfully.", status: 201 };
}

/**
 * Updates an existing project.
 * @param projectId The ID of the project to update.
 * @param formData The form data containing project details to update.
 * @returns An object containing an error message if the update fails.
 */
export async function updateProject(projectId: number, formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(`${DJANGO_API_HOST}/spec/projects/${projectId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update project:", errorData);
      return { error: errorData.detail || "Failed to update project", status: response.status };
    }

    const data = await response.json();
    return { success: true, project: data, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred. Please try again.", status: 500 };
  }
}