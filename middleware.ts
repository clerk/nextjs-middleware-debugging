import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const query = new URL(req.url).searchParams;
  const action = query.get("action");

  // Don't modify unless indicated
  if (!action) {
    return NextResponse.next();
  }

  const newUrl = new URL(req.url);

  if (action === "set-query-param") {
    const name = query.get("name");
    const value = query.get("value");
    if (name && value) {
      newUrl.searchParams.set(name, value);
      return NextResponse.rewrite(newUrl);
    } else {
      throw new Error("must set name and value to set a query param");
    }
  }

  if (action === "delete-query-param") {
    const name = query.get("name");
    if (name) {
      newUrl.searchParams.delete(name);
      return NextResponse.rewrite(newUrl);
    } else {
      throw new Error("must set name to delete a query param");
    }
  }

  if (action === "set-cookie") {
    const name = query.get("name");
    const value = query.get("value");
    if (name && value) {
      const response = NextResponse.rewrite(newUrl);
      response.cookies.set(name, value);
      return NextResponse.rewrite(newUrl);
    } else {
      throw new Error("must set name and value to set a cookie");
    }
  }

  if (action === "delete-cookie") {
    const name = query.get("name");
    if (name) {
      newUrl.searchParams.delete(name);
      return NextResponse.rewrite(newUrl);
    } else {
      throw new Error("must set name to delete a cookie");
    }
  }

  if (action === "set-header") {
    const headers = new Headers();
    const name = query.get("name");
    const value = query.get("value");
    if (name && value) {
      headers.set(name, value);
      return NextResponse.rewrite(req.url, { headers });
    } else {
      throw new Error("must set name and value to add a header");
    }
  }

  throw new Error(`Unrecognized action received in middleware: ${action}`);
}
