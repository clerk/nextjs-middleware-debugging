# About

This repo was built to help determine how a value can be computed in Next.js middleware and then read from the final endpoint.

Specifically, we test whether a Next.js middleware rewrite() leads to changes in the "Request" object that Next.js endpoints receive.

# How to use

There are four "endpoints" in this repo:

1. /page/node
2. /page/edge
3. /api/node
4. /api/edge

The endpoints run on the runtime indicated in their path, using the Next.js (https://nextjs.org/docs/advanced-features/react-18/switchable-runtime)[switchable runtime].

Page endpoints are configured to print the URL and headers that `getServerSideProps` receives inside `context.req`. The data is wrapped in triple hyphens (e.g. ---) for easy parsing from the command line.

API endpoints are configured to print the URL and headers received through the `request` parameter.

Before endpoints receive a request, Next.js Middleware can be directed to run a mutation. The mutation is applied using "NextResponse.rewrite()"

Mutations are applied to the query string, cookies, or headers. They are not applied to the path, since our goal is to compute a value in middleware and pass it to the requested endpoint. We do not want to change the endpoint.

Mutations are specified using the `mutation` query param. The available values are:

- `set-query-param`
- `set-cookie`
- `set-header`

Each mutation also requires `name` and `value` params

# Results

We use cURL to determine the behavior since browsers bloat requests with headers that are not helpful for debugging.

We run the cURL requests against both development and production environment. The production environment is hosted on Vercel.

## Baseline

### /page/node

**Command**

```
echo "/page/node route\n\n" \
&& echo "Dev\n\n" \
&& curl -s "http://localhost:3000/page/node" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "/page/edge route\n\n" \
&& echo "Dev\n\n" \
&& curl -s "http://localhost:3000/page/edge" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "/api/node route\n\n" \
&& echo "Dev\n\n" \
&& curl -s "http://localhost:3000/api/node" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "/api/edge route\n\n" \
&& echo "Dev\n\n" \
&& curl -s "http://localhost:3000/api/edge" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

**Response**

Dev

```
{
  "headers": {
    "host": "localhost:3000",
    "user-agent": "curl/7.79.1",
    "accept": "*/*"
  },
  "url": "/api/node"
}
```

Prod

```
{
  "headers": {
    "host": "nextjs-middleware-debugging.vercel.app",
    "x-real-ip": "205.220.128.102",
    "x-vercel-proxied-for": "205.220.128.102",
    "x-vercel-deployment-url": "nextjs-middleware-debugging-1hhjnhuxx-clerk-production.vercel.app",
    "x-vercel-ip-latitude": "37.751",
    "x-vercel-forwarded-for": "205.220.128.102",
    "x-vercel-id": "sfo1::jn9jd-1663429225881-6d3cd2fca629",
    "x-matched-path": "/api/node",
    "x-vercel-ip-longitude": "-97.822",
    "accept": "*/*",
    "x-vercel-ip-country": "US",
    "x-forwarded-proto": "https",
    "x-vercel-proxy-signature": "Bearer 4d305d2d801d2dc25a13ecfdce0738c3ae5a8504557be98de9d1e5c53862aef0",
    "x-forwarded-for": "205.220.128.102",
    "user-agent": "curl/7.79.1",
    "forwarded": "for=205.220.128.102;host=nextjs-middleware-debugging.vercel.app;proto=https;sig=0QmVhcmVyIDRkMzA1ZDJkODAxZDJkYzI1YTEzZWNmZGNlMDczOGMzYWU1YTg1MDQ1NTdiZTk4ZGU5ZDFlNWM1Mzg2MmFlZjA=;exp=1663429525",
    "x-vercel-ip-timezone": "America/Chicago",
    "x-vercel-proxy-signature-ts": "1663429525",
    "x-forwarded-host": "nextjs-middleware-debugging.vercel.app",
    "connection": "close"
  },
  "url": "/api/node"
}
```

**Result**

### /page/node

## Set a query param

## Set a header

## Set a cookie

### /page/node

### /page/node

❌✅

```

```
