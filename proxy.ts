import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "CATEGORY:WEBHOOK",
      ],
    }),
  ],
});

type KindeAwareRequest = NextRequest & {
  kindeAuth?: {
    user?: { org_code?: string };
    token?: {
      org_code?: string;
      claims?: {
        org_code?: string;
        organization?: string;
      };
    };
  };
};

async function existingMiddleware(req: NextRequest) {
  const { nextUrl } = req as NextRequest;
  const kinde = (req as KindeAwareRequest).kindeAuth;

  const orgCode =
    kinde?.user?.org_code ||
    kinde?.token?.org_code ||
    kinde?.token?.claims?.org_code ||
    kinde?.token?.claims?.organization;

  if (nextUrl.pathname.startsWith("/workspace")) {
    if (!orgCode) {
      if (nextUrl.pathname !== "/workspace") {
        nextUrl.pathname = "/workspace";
        return NextResponse.redirect(nextUrl);
      }

      return NextResponse.next();
    }

    if (nextUrl.pathname === "/workspace") {
      nextUrl.pathname = `/workspace/${orgCode}`;
      return NextResponse.redirect(nextUrl);
    }

    if (!nextUrl.pathname.includes(orgCode)) {
      nextUrl.pathname = `/workspace/${orgCode}`;
      return NextResponse.redirect(nextUrl);
    }
  }

  return NextResponse.next();
}

export default createMiddleware(
  aj,
  withAuth(existingMiddleware, {
    publicPaths: ["/", "/api/auth/**", "/api/uploadthing"],
  }) as NextMiddleware,
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
};
