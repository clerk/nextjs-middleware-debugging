import type { NextRequest } from "next/server";
import serialize from "../../serializeRequest";

export default function handler(req: NextRequest) {
  console.log(req);
  return new Response(
    serialize({
      headers: Object.fromEntries(req.headers),
      url: req.url,
    })
  );
}

export const config = {
  runtime: "experimental-edge",
};
