"use server";

import { cookies } from "next/dist/server/request/cookies";
import { remark } from "remark";
import html from "remark-html";

const SPEC_API_HOST = process.env.SPEC_API_HOST;

export async function generateDiagram(projectId:number, specificationId:number,input: string, output: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { error: "Unauthorized", status: 401 };
    }

    const url = `${SPEC_API_HOST}/spec/ai/generatediagram/`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        project_id: projectId,
        specification_id: specificationId,
        input_data: input, 
        output_data: output }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || "Failed to generate diagram.", status: response.status };
    }
    const data = await response.json();
    return {
      data: data,
      status: 200,
    };
  } catch (error) {
    console.error("Error in generateDiagram:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function convertMarkdownToHtml(markdownString: string) {
  const result = await remark().use(html).process(markdownString);
  return result.toString();
}

export async function generateTestCases(
  projectId: number,
  specificationId: number,
  specificationRevisionId: number,
  specificationContent: string,
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { error: "Unauthorized", status: 401 };
    }

    const url = `${SPEC_API_HOST}/spec/ai/generatetestcases/`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        specification_id: specificationId,
        specification_revision_id: specificationRevisionId,
        specification_content: specificationContent,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || "Failed to generate test cases.", status: response.status };
    }
    const data = await response.json();
    return {
      data: data,
      status: 200,
    };
  } catch (error) {
    console.error("Error in generateTestCases:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}


export async function getDiffSummary(content1: string, content2: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { error: "Unauthorized", status: 401 };
    }

    const url = `${SPEC_API_HOST}/spec/ai/diffsummary/`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content1, content2 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.detail || "Failed to get diff summary.",
        status: response.status,
      };
    }
    const data = await response.json();
    return { data, status: 200 };
  } catch (error) {
    console.error("Error in getDiffSummary:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}