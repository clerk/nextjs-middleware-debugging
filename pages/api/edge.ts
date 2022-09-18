import type { NextRequest } from "next/server";

export default function handler(req: NextRequest) {
  return new Response(req.url);
}

export const config = {
  runtime: "experimental-edge",
};
