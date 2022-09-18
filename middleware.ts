import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const query = new URL(req.url).searchParams;
  const rewrite = query.get("rewrite");

  if (rewrite) {
    const newUrl = new URL(rewrite, req.url);
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}
