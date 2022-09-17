import type { NextApiRequest, NextApiResponse } from "next";
import serialize from "../../serializeRequest";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.send(
    serialize({
      headers: req.headers,
      url: req.url,
    })
  );
}
