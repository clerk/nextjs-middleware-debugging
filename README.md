# About

This repo was built to help determine how calling NextResponse.rewrite() in Next.js impacts the Request object received at the final _endpoint_, which we define as either a React Page or a API Route.

We found that there is inconsistency across development and production, and across node and edge runtimes. We detail those inconsistencies below and provide commands to reproduce.

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

Mutations are applied to the full URL, query string (URLSearchParams), cookies, or headers.

Pathname mutations are specified with the `rewriteUrl` query param.

Mutations are specified using the `mutation` query param. The available values are:

- `set-url` - Also requires `to` param
- `set-query-param` - Also requires `name` and `value` params
- `set-cookie` - Also requires `name` and `value` params
- `set-header` - Also requires `name` and `value` params

# Results

We use cURL to determine the behavior since browsers bloat requests with headers that are not helpful for debugging.

We run the cURL requests against both development and production environment. The production environment is hosted on Vercel.

## Baseline

### /page/node

**Command**

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/node" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/edge" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/node" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/edge" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

**Results**

Every endpoint behaves mostly consistently, with one exception.

Edge API routes have a full URL in req.url while the others only have a pathname.

## Set a query param

**Command**

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/node?action=set-query-param&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node?action=set-query-param&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/edge?action=set-query-param&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge?action=set-query-param&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/node?action=set-query-param&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node?action=set-query-param&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/edge?action=set-query-param&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge?action=set-query-param&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

**Results**

_/page/node_

For dev, `context.req.url` fails at having the `foo=bar` query param appended

For prod, `context.req.url` succeeds at having the `foo=bar` query param appended

_/page/edge_
For both dev and prod, `context.req.url` succeeds at having the `foo=bar` query param appended

_/api/node_

For dev, `request.url` fails at having the `foo=bar` query param appended

For prod, `request.url` succeeds at having the `foo=bar` query param appended

_/api/edge_
For both dev and prod, `request.url` succeeds at having the `foo=bar` query param appended

## Set a header

**Command**

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/node?action=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node?action=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/edge?action=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge?action=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/node?action=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node?action=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/edge?action=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge?action=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

**Results**

For dev, all endpoints fail to receive a header set in middleware.

For prod, node endpoints succeed at receiving a header set in middleware, while edge endpoints fail.

## Set a cookie

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/node?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/edge?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/node?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/edge?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge?action=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

### /page/node

### /page/node

❌✅

```

```
