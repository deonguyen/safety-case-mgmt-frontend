"use server";

import { ProjectSpecificationModel } from "@/src/types/project-specification-model";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const SPEC_API_HOST = process.env.SPEC_API_HOST;

export async function getProjectSpecifications(
  projectId: number,
  page?: number,
  pageSize?: number,
  filterSpecSource?: string,
  filterCategory1?: string,
  filterComponent?: string,
  filterFunction?: string,
  filterSpecificationParent?: string,
  filterSpecificationName?: string,
  filterSpecificationType?: string,
  filterVersion?: string,
): Promise<{
  projectSpecifications?: ProjectSpecificationModel[];
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
    if (filterSpecSource) params.append("specification_source", filterSpecSource);
    if (filterCategory1) params.append("category1", filterCategory1);
    if (filterComponent) params.append("component_name", filterComponent);
    if (filterFunction) params.append("function_name", filterFunction);
    if (filterSpecificationParent)
      params.append("specification_parent", filterSpecificationParent);
    if (filterSpecificationName)
      params.append("specification_name", filterSpecificationName);
    if (filterSpecificationType)
      params.append("specification_type", filterSpecificationType);
    if (filterVersion) params.append("specification_version", filterVersion);
    const queryString = params.toString();
    const url = queryString
      ? `${SPEC_API_HOST}/spec/project-specifications/?${queryString}`
      : `${SPEC_API_HOST}/spec/project-specifications/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Failed to fetch project specifications.", status: response.status };
    }
    const data = await response.json();

    if (data.results) {
      return { projectSpecifications: data.results, count: data.count, status: 200 };
    }

    // Fallback if API returns array directly (no pagination)
    if (Array.isArray(data)) {
        return { projectSpecifications: data, count: data.length, status: 200 };
    }

    return { projectSpecifications: [], count: 0, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function createProjectSpecification(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  const project = formData.get("project");
  const component = formData.get("component");
  const func = formData.get("function");
  const specification = formData.get("specification");
  const category1 = formData.get("category1");
  const category2 = formData.get("category2");
  const specificationOrder = formData.get("specificationOrder");
  const complexity = formData.get("complexity");
  const priority = formData.get("priority");
  const process = formData.get("process");
  const specificationType = formData.get("specificationType");
  const version = formData.get("version");

  const body = {
    project: project ? parseInt(project.toString()) : null,
    component: component ? parseInt(component.toString()) : null,
    function: func ? parseInt(func.toString()) : null,
    specification: specification ? parseInt(specification.toString()) : null,
    category1: category1,
    category2: category2,
    specification_order: specificationOrder
      ? parseInt(specificationOrder.toString())
      : 0,
    complexity: complexity ? parseInt(complexity.toString()) : null,
    priority: priority ? parseInt(priority.toString()) : null,
    process: process ? parseInt(process.toString()) : null,
    specification_type: specificationType,
    version: version,
  };

  try {
    const response = await fetch(`${SPEC_API_HOST}/spec/project-specifications/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { error: "Failed to create project specification", status: response.status };
    }
    revalidatePath("/projectspecification");
    return { success: true, message: "Success", status: 201 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function deleteProjectSpecification(id: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(
      `${SPEC_API_HOST}/spec/project-specifications/${id}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      return { error: "Failed to delete project specification.", status: response.status };
    }
    revalidatePath("/project-specification");
    return { success: true, message: "Deleted successfully", status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function localFileImportProjectSpecifications(
  localFile: File,
  importVersion: string,
  projectId: number,
): Promise<{
  projectSpecifications?: ProjectSpecificationModel[];
  error?: string;
  status?: number;
  message?: string;
}> {
  const formData = new FormData();
  formData.append("file", localFile);
  formData.append("version", importVersion);
  formData.append("project_id", projectId.toString());

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // We are now calling our internal Next.js API route, not Django directly.
    // This request happens server-to-server if called from a server component,
    // but here it's a client-side fetch to our new API endpoint.
    // For simplicity and to handle the "fire-and-forget" nature, we'll make this a client-side fetch.
    // To do that, we need to move this function out of the "use server" file or make it a client-side utility.
    // Let's adjust this to be a simple fetch that can be called from the client.
    
    // The function is called from a "use client" component, so it will execute on the client.
    // We will call our new API endpoint.
    // const response = await fetch('/api/import-specifications/import_specification_from_local_file/', {
    //   method: 'POST',
    //   body: formData,
    // });
    const response = await fetch(
      `${SPEC_API_HOST}/spec/import-specifications/import_specification_from_local_file/`, {
      method: 'POST',
      headers: {
          //"Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "File upload failed.", status: response.status };
    }

    // The Django backend is what queues the process.
    // Our API route now forwards Django's response.
    return await response.json();
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function localFolderImportProjectSpecifications(
  localFolder: string,
  importVersion: string,
  projectId: number,
): Promise<{
  projectSpecifications?: ProjectSpecificationModel[];
  error?: string;
  status?: number;
  message?: string;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    fetch(
      `${SPEC_API_HOST}/spec/import-specifications/import_specification_from_local_folder/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          local_folder: localFolder,
          version: importVersion,
          project_id: projectId,
        }),
        cache: "no-store",
      },
    ).catch((err) => console.error("Cannot connect to backend API:", err));

    return { message: "Queue process in background", status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

// export async function googleDriveImportProjectSpecifications(
//   googleDriveLink: string,
//   importVersion: string,
//   projectId: number,
//   googleAccessToken: string,
// ): Promise<{
//   projectSpecifications?: ProjectSpecificationModel[];
//   error?: string;
//   status?: number;
//   message?: string;
// }> {
//   const cookieStore = await cookies();
//   const accessToken = cookieStore.get("accessToken")?.value;

//   if (!accessToken) {
//     return { error: "Unauthorized", status: 401 };
//   }

//   if (!googleAccessToken) {
//     return { error: "Missing Google Drive access token.", status: 400 };
//   }

//   try {
//     // Fire and forget the fetch request to immediately return
//     fetch(
//       `${SPEC_API_HOST}/spec/import-specifications/import_specification_from_google_drive/`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           folder_id: googleDriveLink,
//           version: importVersion,
//           project_id: projectId,
//           google_access_token: googleAccessToken,
//         }),
//         cache: "no-store",
//       },
//     ).catch((err) => console.error("Cannot connect to backend API:", err));

//     return { message: "Queue process in background", status: 200 };
//   } catch (error) {
//     console.error("Cannot connect to backend API:", error);
//     return { error: `An unexpected error occurred: ${error}`, status: 500 };
//   }
// }

export async function googleDriveImportProjectSpecifications(
  folderLocation: string,
  importVersion: string,
  projectId: number,
): Promise<{
  projectSpecifications?: ProjectSpecificationModel[];
  error?: string;
  status?: number;
  message?: string;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // Fire and forget the fetch request to immediately return
    fetch(
      `${SPEC_API_HOST}/spec/import-specifications/import_specification_from_google_drive/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          folder_id: folderLocation,
          version: importVersion,
          project_id: projectId
        }),
        cache: "no-store",
      },
    ).catch((err) => console.error("Cannot connect to backend API:", err));

    return { message: "Queue process in background", status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function updateProjectSpecification(formData: FormData) {
  const id = formData.get("id");
  const projectId = formData.get("project");
  const componentId = formData.get("component");
  //const functionId = formData.get("function");
  const specificationId = formData.get("specification");
  const category1 = formData.get("category1");
  const category2 = formData.get("category2");
  const specificationOrder = formData.get("specificationOrder");
  const specificationType = formData.get("specificationType");
  const version = formData.get("version");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(
      `${SPEC_API_HOST}/spec/project-specifications/${id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          component_id: componentId,
          //function_id: functionId,
          specification_id: specificationId,
          category1: category1,
          category2: category2,
          specification_order: specificationOrder,
          specification_type: specificationType,
          version: version,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error:
          errorData.detail || "Failed to update project specification link.",
        status: response.status,
      };
    }
    revalidatePath("/project-specification");
    return { success: true, message: "Updated successfully", status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: "An unexpected error occurred. Please try again.", status: 500 };
  }
}

export async function githubImportProjectSpecifications(
  releaseTag:string,
  projectId: number,
): Promise<{
  projectSpecifications?: ProjectSpecificationModel[];
  error?: string;
  status?: number;
  message?: string;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    fetch(
      `${SPEC_API_HOST}/spec/import-specifications/import_specification_from_github_release/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          release_tag: releaseTag,
          project_id: projectId,
        }),
        cache: "no-store",
      },
    ).catch((err) => console.error("Cannot connect to backend API:", err));

    return { message: "Queue process in background", status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

export async function jamaImportProjectSpecifications(
  jamaUrl: string,
  jamaProjectId: string,
  importVersion: string,
  projectId: number,
): Promise<{
  projectSpecifications?: ProjectSpecificationModel[];
  error?: string;
  status?: number;
  message?: string;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    fetch(
      `${SPEC_API_HOST}/spec/import-specifications/import_specification_from_jama/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          jama_url: jamaUrl,
          jama_project_id: jamaProjectId,
          version: importVersion,
        }),
        cache: "no-store",
      },
    ).catch((err) => console.error("Cannot connect to backend API:", err));

    return { message: "Queue process in background", status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}