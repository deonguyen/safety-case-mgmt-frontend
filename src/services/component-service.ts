"use server";

import { ComponentModel } from "@/src/types/component-model";
import { cookies } from "next/headers";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;
export async function getComponents(
  page?: number,
  pageSize?: number,
  projectId?: number,
): Promise<{
  components?: ComponentModel[];
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
  if (projectId) params.append("project", projectId.toString());
  const queryString = params.toString();
  const url = queryString
    ? `${DJANGO_API_HOST}/spec/components/?${queryString}`
    : `${DJANGO_API_HOST}/spec/components/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Failed to fetch components.", status: response.status };
    }
    const data = await response.json();
    if (data.results) {
      return { components: data.results, count: data.count, status: 200 };
    }
    return { components: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}