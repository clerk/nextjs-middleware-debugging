import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.send(
    JSON.stringify({
      headers: req.headers,
      url: req.url,
    })
  );
}
