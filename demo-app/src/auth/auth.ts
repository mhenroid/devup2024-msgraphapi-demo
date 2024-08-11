import NextAuth from "next-auth";
import type { NextAuthConfig, Session, User } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { NextRequest } from "next/server";

export interface AuthSession extends Session {
  error: any;
  access_token: string;
}

const authorizeRoute = (request: NextRequest, auth: Session | null) => {
  let pathName = request.nextUrl.pathname;

  // Authorize certain pages always
  if (
    // Unauthorized page, nextjs specific pages, favicon.ico
    pathName.match(
      /^\/(?:unauthorized|_next\/static|_next\/image|favicon.ico).*/
    ) ||
    pathName == "/" || // Root path
    pathName.match(/^\/(?:api\/auth\/).*/) // Authorization paths
  ) {
    return true;
  }

  // If user is not authorized navigate to the login page
  if (!auth || !auth.user) {
    return false;
  }

  return true;
};

/**
 * Configuration for NextAuth 5
 */
const config: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: process.env.AZURE_AD_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    // Used to determine whether the user is authorized or not
    // Return 'false' to send user to the login page
    // Return 'true' to authorize user
    // Return NextResponse if redirect or json response
    authorized({ request, auth }) {
      return authorizeRoute(request, auth);
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, account, user }) {
      // If the access token is available save it in the token
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
        return token;
      }
      // @ts-ignore
      else if (Date.now() < token.expires_at * 1000) {
        // If the access token has not expired yet, return it
        return token;
      } else {
        // If the access token has expired, try to refresh it
        try {
          let tenantId = process.env.AZURE_AD_TENANT_ID;
          let clientId = process.env.AZURE_AD_CLIENT_ID;
          let clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
          const response = await fetch(
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            {
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              // @ts-ignore
              body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "refresh_token",
                refresh_token: token.refresh_token,
              }),
              method: "POST",
            }
          );

          const tokens = await response.json();
          if (!response.ok) throw tokens;

          return {
            ...token, // Keep the previous token properties
            access_token: tokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
            // Fall back to old refresh token, but note that
            // many providers may only allow using a refresh token once.
            refresh_token: tokens.refresh_token ?? token.refresh_token,
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          // The error property will be used client-side to handle the refresh token error
          return { ...token, error: "RefreshAccessTokenError" as const };
        }
      }
    },
    async session({ session, token }) {
      // @ts-ignore
      session.error = token.error;
      // @ts-ignore
      session.access_token = token.access_token;
      return session;
    },
  },
};

const { handlers, auth, signIn, signOut } = NextAuth(config);

// A wrapper around auth() to make it easier to get auth session data
const getAuthSession = async (): Promise<AuthSession> => {
  let session = await auth();
  return session as AuthSession;
};

export { handlers, auth, signIn, signOut, getAuthSession };
