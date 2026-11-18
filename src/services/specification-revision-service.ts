"use server";

import { SpecificationRevisionModel } from "@/src/types/specification-revision-model";
import { cookies } from "next/headers";

const SPEC_API_HOST = process.env.SPEC_API_HOST;

export async function getSpecificationRevisions(
  page?: number,
  pageSize?: number,
): Promise<{
  specificationRevisions?: SpecificationRevisionModel[];
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
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/specification-revisions/?${queryString}`
      : `${SPEC_API_HOST}/spec/specification-revisions/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specification revisions.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        specificationRevisions: data.results,
        count: data.count,
        status: 200,
      };
    }
    return { specificationRevisions: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getSpecificationRevisionById(id: number): Promise<{
  specificationRevision?: SpecificationRevisionModel;
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
      `${SPEC_API_HOST}/spec/specification-revisions/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        error: "Failed to fetch specification revision.",
        status: response.status,
      };
    }
    return { specificationRevision: await response.json(), status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getSpecificationRevisionsBySpecificationId(
  specification_id: number,
  page?: number,
  pageSize?: number,
): Promise<{
  specificationRevisions?: SpecificationRevisionModel[];
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
    params.append("specification_id", specification_id.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/specification-revisions/?${queryString}`
      : `${SPEC_API_HOST}/spec/specification-revisions/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch specification revisions.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        specificationRevisions: data.results,
        count: data.count,
        status: 200,
      };
    }
    return { specificationRevisions: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getFirstSpecificationRevisionsBySpecificationId(
  specification_id: number,
): Promise<{
  specificationRevision?: SpecificationRevisionModel;
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
      `${SPEC_API_HOST}/spec/specification-revisions/first/?specification_id=${specification_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        error: "Failed to fetch specification revision.",
        status: response.status,
      };
    }
    const revision = await response.json();
    return { specificationRevision: revision, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getDistinctVersion(): Promise<{
  versions?: string[];
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
      `${SPEC_API_HOST}/spec/specification-revisions/distinct_version`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        error: "Failed to fetch distinct versions.",
        status: response.status,
      };
    }
    const result = await response.json();
    return { versions: result, status: 200 };
  } catch (error) {
    console.error("Error in getDistinctVersion:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}
