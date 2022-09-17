import type { NextRequest } from "next/server";

export default function handler(req: NextRequest) {
  console.log(req);
  return new Response(
    JSON.stringify({
      headers: Object.fromEntries(req.headers),
      url: req.url,
    })
  );
}

export const config = {
  runtime: "experimental-edge",
};
