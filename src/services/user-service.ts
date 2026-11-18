/**
 * @file This module contains server-side actions for user-related operations,
 * including fetching the user profile and managing user settings.
 */
"use server";

import { UserSettingModel } from "@/src/types/user-setting-model";
import { cookies } from "next/headers";
import { UserModel } from "../types/user-model";

/**
 * Retrieves the user's settings from the Django backend.
 * @returns A promise that resolves to the user settings or an error message.
 */
export async function getUserSetting() {
  console.log("Fetching user settings...");
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value ?? null;
  console.log("User ID from cookies:", userId);
  const accessToken = cookieStore.get("accessToken")?.value;
  console.log("Access Token from cookies:", accessToken);
  const DJANGO_API_HOST = process.env.DJANGO_API_HOST;
  console.log("Django API Host:", DJANGO_API_HOST);
  if (!accessToken || !userId) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // 1. Fetch user settings from the API.
    const response = await fetch(
      `${DJANGO_API_HOST}/spec/usersettings/?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    // 2. Handle failed fetch attempts.
    if (!response.ok) {
      return { error: "Failed to fetch user settings.", status: response.status };
    }

    const userSettings: UserSettingModel = await response.json();
    return { userSettings, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

/**
 * Retrieves the user's profile information.
 * @returns A promise that resolves to the user profile or an error message.
 */
export async function getUserProfile(): Promise<{
  user?: UserModel | null;
  error?: string;
  status?: number;
}> {
  console.log("Fetching user profile...");
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value ?? null;
  const accessToken = cookieStore.get("accessToken")?.value;
  const DJANGO_API_HOST = process.env.DJANGO_API_HOST;
  if (!accessToken || !userId) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // 1. Fetch user profile from the API.
    const response = await fetch(`${DJANGO_API_HOST}/spec/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    // 2. Handle failed fetch attempts.
    if (!response.ok) {
      return { error: "Failed to fetch user profile.", status: response.status };
    }
    return { user: await response.json(), status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}

/**
 * Saves the updated user settings to the backend and synchronizes relevant cookies.
 * @param userSettingsData The updated settings to save.
 * @returns A promise indicating success, along with the saved settings or an error message.
 */
export async function saveUserSetting(
  userSettingsData: UserSettingModel,
): Promise<{
  success: boolean;
  userSettings?: UserSettingModel;
  error?: string;
  status?: number;
}> {
  console.log("Saving user settings...");
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const accessToken = cookieStore.get("accessToken")?.value;
  const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

  if (!accessToken || !userId) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  try {
    // 1. Send the updated settings to the API.
    const response = await fetch(
      `${DJANGO_API_HOST}/spec/usersettings/${userSettingsData.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userSettingsData),
      },
    );

    // 2. Handle failed save attempts.
    if (!response.ok) {
      return { success: false, error: "Failed to save user settings.", status: response.status };
    }

    const userSettings: UserSettingModel = await response.json();

    // 3. Keep cookies in sync with newly saved settings for immediate client-side updates.
    if (userSettings.page_size) {
      cookieStore.set("page_size", userSettings.page_size.toString(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });
    }
    if (userSettings.project_id) {
      cookieStore.set("project_id", userSettings.project_id.toString(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });
    }

    // 4. Return the successful response.
    return { success: true, userSettings, status: 200 };
  } catch (error) {
    console.error("Cannot connect to backend API:", error);
    return { success: false, error: `An unexpected error occurred: ${error}`, status: 500 };
  }
}
