"use server";

import { cookies, headers } from "next/headers";
import { CodeImplementationTraceModel } from "../types/code-implementation-trace-model";
import { CodeImplementationTraceLogModel } from "../types/code-implementation-trace-log-model";

const SPEC_API_HOST = process.env.SPEC_API_HOST;

export async function getCodeImplementationTraces(
  projectId: number,
  page?: number,
  pageSize?: number,
): Promise<{
  results?: CodeImplementationTraceModel[];
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
    params.append("project_id", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/code-implementation-traces/?${queryString}`
      : `${SPEC_API_HOST}/spec/code-implementation-traces/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch code implementation traces.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        count: data.count,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getCodeImplementationTraceLogs(
  projectId: number,
  page?: number,
  pageSize?: number,
  filterSpecificationName?: string,
  filterTraceType?: string,
): Promise<{
  results?: CodeImplementationTraceLogModel[];
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
    params.append("project_id", projectId.toString());
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("page_size", pageSize.toString());
    if (filterSpecificationName)
      params.append("specification_name", filterSpecificationName);
    if (filterTraceType) params.append("trace_type", filterTraceType);
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/code-implementation-trace-logs/?${queryString}`
      : `${SPEC_API_HOST}/spec/code-implementation-trace-logs/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch code implementation trace logs.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        count: data.count,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getCodeDependencyTraces(): Promise<{
  results?: string;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }
  try {
    const url = `${SPEC_API_HOST}/spec/code-implementation-traces/get_code_dependency_traces/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch code dependency traces.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getExecutionSummary(): Promise<{
  results?: string;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }
  try {
    const url = `${SPEC_API_HOST}/spec/codeql/execution_summary/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to fetch execution summary.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function importCodeTraceabilityFromGithubPullrequests(
  projectId: number,
  githubUrl: string,
): Promise<{
  results?: string;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }
  try {
    const url = `${SPEC_API_HOST}/spec/import-traceability/import_code_traceability_from_prs/`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        github_url: githubUrl,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to trigger code implementation trace.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function importCodeTraceabilityFromGithubRepository(
  projectId: number,
  githubUrl: string,
): Promise<{
  results?: string;
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }
  try {
    const url = `${SPEC_API_HOST}/spec/import-traceability/import_code_traceability_from_repos/`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        github_url: githubUrl,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Failed to trigger code implementation trace.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function getSpecificationImplementCount(
  projectId: number,
): Promise<{
  results?: string;
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
    params.append("project_id", String(projectId));
    if (projectId) params.append("project_id", projectId.toString());
    const url = `${SPEC_API_HOST}/spec/code-implementation-trace-logs/get_specification_implement_count/?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        error: "Failed to trigger code implementation trace.",
        status: response.status,
      };
    }
    const data = await response.json();
    if (data.results) {
      return {
        results: data.results,
        status: 200,
      };
    }
    return { results: data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}
