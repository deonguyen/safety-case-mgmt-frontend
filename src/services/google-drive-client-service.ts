"use client";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

let gisScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Identity Services can only load in the browser."),
    );
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services.")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });
  return gisScriptPromise;
}

export async function requestGoogleDriveAccessToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Set it in your environment file.",
    );
  }
  await loadGoogleIdentityScript();
  return new Promise<string>((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error("Google Identity Services failed to initialize."));
      return;
    }
    const tokenClient = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                "Google authorization failed.",
            ),
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (err) => {
        reject(new Error(err?.message || "Google authorization was cancelled."));
      },
    });
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
}

export async function listGoogleDriveFolders(
  accessToken: string,
): Promise<GoogleDriveFolder[]> {
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.folder' and trashed = false",
    fields: "files(id,name)",
    pageSize: "100",
    orderBy: "name",
  });
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to list Google Drive folders (status ${response.status}).`,
    );
  }
  const data = (await response.json()) as { files?: GoogleDriveFolder[] };
  return data.files ?? [];
}
