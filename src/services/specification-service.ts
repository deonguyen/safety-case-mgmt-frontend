"use server";

import { SpecificationModel } from "@/src/types/specification-model";
import { cookies } from "next/headers";

const SPEC_API_HOST = process.env.SPEC_API_HOST;
export async function getSpecifications(
  projectId: number,
  page?: number,
  pageSize?: number,
  componentName?: string,
  functionName?: string,
  specificationName?: string,
  category?: string,
): Promise<{
  specifications?: SpecificationModel[];
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
    if (projectId) params.append("project_id", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    if (specificationName)
      params.append("specification_name", specificationName.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/specifications/?${queryString}`
      : `${SPEC_API_HOST}/spec/specifications/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specifications.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return { specifications: data.results, count: data.count, status: 200 };
    }
    return { specifications: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function getSpecificationBySql(
  projectId: number,
  page?: number,
  pageSize?: number,
  componentName?: string,
  functionName?: string,
  specificationName?: string,
  category?: string,
): Promise<{
  specifications?: SpecificationModel[];
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
    if (projectId) params.append("project_id", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    if (componentName) params.append("component_name", componentName);
    if (functionName) params.append("function_name", functionName);
    if (specificationName)
      params.append("specification_name", specificationName);
    if (category) params.append("category", category);
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/specifications/get_specification_by_sql/?${queryString}`
      : `${SPEC_API_HOST}/spec/specifications/get_specification_by_sql/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specifications.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return { specifications: data.results, count: data.count, status: 200 };
    }
    return { specifications: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function getSpecificationById(id: number): Promise<{
  specification?: SpecificationModel;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const url = `${SPEC_API_HOST}/spec/specifications/${id}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specification.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return { specification: data.results, status: 200 };
    }
    return { specification: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function getSpecificationByCode(code: string): Promise<{
  specifications?: SpecificationModel[];
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
    if (code) params.append("code", code);
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/specifications/?${queryString}`
      : `${SPEC_API_HOST}/spec/specifications/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specifications.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return { specifications: data.results, status: 200 };
    }
    return { specifications: data, status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function createSpecification(formData: FormData) {
  const name = formData.get("name");
  const code = formData.get("code");
  const internal_id = formData.get("internal_id");
  const source = formData.get("source");
  const version = formData.get("version");
  const status = formData.get("status");
  const type = formData.get("type");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(`${SPEC_API_HOST}/spec/specifications/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        code,
        internal_id,
        source,
        version,
        status,
        type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.detail || "Failed to create specification",
        status: response.status,
      };
    }
  } catch (error) {
    console.error("Create specification error:", error);
    return {
      error: "An unexpected error occurred. Please try again.",
      status: 500,
    };
  }

  return {
    success: true,
    message: "Specification created successfully.",
    status: 201,
  };
}

export async function getJamaSpecificationHierarchy(
  projectId: number,
): Promise<{
  hierarchy?: any;
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
    params.append("project_id", projectId.toString());
    const queryString = params.toString();
    const url = `${SPEC_API_HOST}/spec/specifications/get_jama_specification_hierarchy/?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch Jama specification hierarchy.",
        status: response.status,
      };
    }
    return { hierarchy: await response.json(), status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function getDistinctSpecificationType(projectId: number): Promise<{
  results?: string[];
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
    params.append("project_id", projectId.toString());
    const queryString = params.toString();
    const url = `${SPEC_API_HOST}/spec/specifications/get_distinct_specification_type/?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch Jama specification hierarchy.",
        status: response.status,
      };
    }
    return { results: await response.json(), status: 200 };
  } catch (error) {
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}
