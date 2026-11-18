"use server";

import { cookies } from "next/headers";
import { SpecificationTestCaseModel } from "../types/specification-test-case-model";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

export async function getSpecificationTestCases(
  projectId: number,
  specificationId: number,
  specificationRevisionId: number,
  specificationTestSuiteId: number,
): Promise<{
  data?: SpecificationTestCaseModel[];
  error?: string;
  status?: number;
}> {
  return (async () => {
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
      params.append(
        "specification_test_suite_id",
        specificationTestSuiteId.toString(),
      );

      const url = `${DJANGO_API_HOST}/spec/specification-test-cases/?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return {
          error: "Failed to fetch specification test cases.",
          status: response.status,
        };
      }
      const data = await response.json();
      return { data, status: 200 };
    } catch (error) {
      return { error: `An unexpected error occurred: ${error}`, status: 500 };
    }
  })();
}
