// export { auth as middleware } from "@/auth";
import { auth } from "@/auth/auth";
import { NextRequest } from "next/server";

export const middleware = async (request: NextRequest) => {
  // @ts-ignore
  return auth(request);
};

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico).*)",
//     "/((?!api/auth).*)",
//   ],
// };
