"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const DJANGO_API_HOST = process.env.DJANGO_API_HOST;
export interface AppNotification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<{
  notifications?: AppNotification[];
  error?: string;
  status?: number;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(`${DJANGO_API_HOST}/spec/notifications/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store", // Ensure we always fetch the latest notifications
    });

    if (!response.ok) {
      return { error: "Failed to fetch notifications.", status: response.status };
    }

    const data = await response.json();
    // Handle both paginated and non-paginated API responses
    return { notifications: data.results || data, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function markNotificationAsRead(id: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const response = await fetch(`${DJANGO_API_HOST}/spec/notifications/${id}/read/`, {
      method: "POST", // Adjust to PUT/PATCH if required by your Django API
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { error: "Failed to mark notification as read.", status: response.status };
    }

    revalidatePath("/"); // Revalidate paths where the notification bell is displayed
    revalidatePath("/notifications");
    return { success: true, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}

export async function markAllNotificationsAsRead(ids: number[]) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    // Process all marks-as-read on the server side in parallel
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`${DJANGO_API_HOST}/spec/notifications/${id}/read/`, {
          method: "POST", // Adjust to PUT/PATCH if required by your Django API
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      )
    );

    if (results.some((res) => !res.ok)) {
      return { error: "Failed to mark some notifications as read.", status: 207 };
    }

    revalidatePath("/");
    revalidatePath("/notifications");
    return { success: true, status: 200 };
  } catch (error) {
    return { error: "An unexpected error occurred.", status: 500 };
  }
}