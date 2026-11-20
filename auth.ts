import NextAuth, { type DefaultSession } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// Extend session and JWT type declarations to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    error?: string;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!,
      authorization: {
        params: {
          // Add any custom API scopes here if you are querying a custom API registration
          scope: "openid profile email offline_access User.Read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: capture tokens from the OAuth provider account
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }

      // If token is still valid, return it as-is
      if (Date.now() < (token.expiresAt ?? 0)) {
        return token;
      }

      // If token expired, perform refresh token exchange
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Expose accessToken and idToken to client/server session
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

/**
 * Handles silent token refresh when accessToken has expired
 */
async function refreshAccessToken(token: any) {
  try {
    const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
    const url = `<https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token>`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
        client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
