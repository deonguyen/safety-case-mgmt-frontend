/**
 * @file This module contains server-side actions for handling user authentication,
 * including login and logout. It communicates with a Django backend for token-based auth.
 */
"use server";
import { cookies } from "next/headers";

// The base URL for the Django API backend.
const DJANGO_API_HOST = process.env.DJANGO_API_HOST;

/**
 * Decodes a JWT token to extract its payload without verifying the signature.
 * This is used to get the user ID from the access token.
 * @param token The JWT string.
 * @returns The decoded payload containing the user_id, or null if decoding fails.
 */
function decodeJwt(token: string): { user_id: number } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString();
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

/**
 * Authenticates a user against the Django backend.
 * On success, it sets httpOnly cookies for access and refresh tokens.
 * @param username The user's username.
 * @param password The user's password.
 * @returns A promise that resolves to an object indicating success or failure,
 * along with a message and HTTP status code.
 */
export async function login(
  username: string,
  password: string,
): Promise<{ success: boolean; message: string; status: number }> {
  try {
    console.log(`Django API Host: ${DJANGO_API_HOST}`);
    
    // 1. Request tokens from the Django API.
    const djangoResponse = await fetch(`${DJANGO_API_HOST}/auth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    });
    
    console.log(`Django API Host: ${djangoResponse.status}`);

    // 2. Handle failed authentication attempts.
    if (!djangoResponse.ok) {
      const errorData = await djangoResponse.json();
      return {
        success: false,
        message: errorData.detail || "Authentication failed",
        status: djangoResponse.status,
      };
    }

    // 3. On success, extract tokens and user ID from the response.
    const { access, refresh } = await djangoResponse.json();
    const decodedToken = decodeJwt(access);
    const userId = decodedToken ? decodedToken.user_id : null;

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Clear all application cookies iteratively before setting new ones
    allCookies.forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });

    // 4. Set secure, httpOnly cookies for the tokens and user info.
    cookieStore.set("accessToken", access, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      sameSite: 'lax', // Adjusted for development; change to 'strict' or 'none' in production as needed
      secure: false,
      path: "/",
      //domain: '.amazonaws.com', // Adjust this to your domain if needed
      maxAge: 60 * 60 * 24, // 1 day
    });

    cookieStore.set("refreshToken", refresh, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      sameSite: 'lax', // Adjusted for development; change to 'strict' or 'none' in production as needed
      secure: false,
      path: "/",
      //domain: '.amazonaws.com', // Adjust this to your domain if needed
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set("username", username, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      sameSite: 'lax', // Adjusted for development; change to 'strict' or 'none' in production as needed
      secure: false,
      path: "/",
      //domain: '.amazonaws.com', // Adjust this to your domain if needed
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (userId) {
      cookieStore.set("user_id", String(userId), {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "strict",
        sameSite: 'lax', // Adjusted for development; change to 'strict' or 'none' in production as needed
        secure: false,
        path: "/",
        //domain: '.amazonaws.com', // Adjust this to your domain if needed
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // 5. Return a success response.
    return { success: true, message: "Login successful", status: 200 };
  } catch (err: unknown) {
    // 6. Handle unexpected errors during the login process.
    console.error("Cannot connect to backend API:", err);
    return {
      success: false,
      message: "An unexpected error occurred during login.",
      status: 500,
    };
  }
}

/**
 * Logs the user out by clearing all authentication-related cookies.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function logout(): Promise<{
  success: boolean;
  message: string;
  status: number;
}> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Clear all application cookies iteratively
    allCookies.forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });

    return { success: true, message: "Logout successful", status: 200 };
  } catch (error) {
    // Handle unexpected errors during the logout process.
    console.error("Logout failed:", error);
    return {
      success: false,
      message: "An unexpected error occurred during logout.",
      status: 500,
    };
  }
}
