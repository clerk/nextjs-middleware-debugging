# About

This repo was built to help determine how calling NextResponse.rewrite() in Next.js impacts the Request object received at the final _endpoint_, which we define as either a React Page or a API Route.

We found that there is inconsistency across development and production, and across node and edge runtimes. We detail those inconsistencies below and provide commands to reproduce.

# How to use

There are four "endpoints" in this repo:

1. /page/node
2. /page/edge
3. /api/node
4. /api/edge

The endpoints run on the runtime indicated in their path, using the Next.js [switchable runtime](https://nextjs.org/docs/advanced-features/react-18/switchable-runtime).

Page endpoints are configured to print the URL and headers that `getServerSideProps` receives inside `context.req`. The data is wrapped in triple hyphens (e.g. ---) for easy parsing from the command line.

API endpoints are configured to print the URL and headers received through the `request` parameter.

Before endpoints receive a request, Next.js Middleware can be directed to run a mutation. The mutation is applied using "NextResponse.rewrite()"

Mutations are applied to the URL, cookies, or headers.

Pathname mutations are specified with the `rewriteUrl` query param.

Mutations are specified using the `mutation` query param. The available values are:

- `set-url` - Also requires `to` param.
- `set-cookie` - Also requires `name` and `value` params. Uses NextResponse cookie utitility.
- `set-header` - Also requires `name` and `value` params.

# Results

We use cURL to determine the behavior since browsers bloat requests with headers that are not helpful for debugging.

We run the cURL requests against both development and production environment. The production environment is hosted on Vercel.

## Baseline

This prints the headers and URL received in each endpoint's Request object when middleware returns NextResponse.next()

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

## Set a new URL

Every request here goes to /foo, but is then rewritten to an endpoint.

We include a query param in the rewrite url (e.g. /api/node?bar=baz) because it illuminates some additional inconsistencies.

**Command**

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/foo?mutation=set-url&to=/page/node?bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/foo?mutation=set-url&to=/page/node?bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/foo?mutation=set-url&to=/page/edge?bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/foo?mutation=set-url&to=/page/edge?bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/foo?mutation=set-url&to=/api/node?bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/foo?mutation=set-url&to=/api/node?bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/foo?mutation=set-url&to=/api/edge?bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/foo?mutation=set-url&to=/api/edge?bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

**Results**

_/page/node_

For dev, `context.req.url` reflects the complete original request URL: "/foo?mutation=set-url&to=/page/node?bar=baz"

For prod, `context.req.url` reflects the original pathname and the rewritten query string: "/foo?bar=baz"

_/page/edge_

For dev, `context.req.url` reflects the complete rewritten request URL: "/page/edge?bar=baz"

From prod, `context.req.url` reflects the original pathname and the rewritten query string: "/foo?bar=baz"

_/api/node_

For dev, `request.url` reflects the complete original request URL: "/foo?mutation=set-url&to=/api/node?bar=baz"

For prod, `request.url` reflects the original pathname and the rewritten query string: "/foo?bar=baz"

_/api/edge_

For dev, `request.url` reflects the complete rewritten request URL: "http://localhost:3000/api/edge?bar=baz"

From prod, `request.url` reflects the original pathname and the rewritten query string: "https://nextjs-middleware-debugging.vercel.app/foo?bar=baz"

## Set a header

This passes `headers` to the second argument of `NextResponse.rewrite()`. (ResponseInit)

It is expected that this will set a response header, not a request header for the rewrite request.

**Command to investigate response headers**

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -sI "http://localhost:3000/page/node?mutation=set-header&name=foo&value=bar" \
&& echo "\n\nProd\n" \
&& curl -sI "https://nextjs-middleware-debugging.vercel.app/page/node?mutation=set-header&name=foo&value=bar" \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -sI "http://localhost:3000/page/edge?mutation=set-header&name=foo&value=bar" \
&& echo "\n\nProd\n" \
&& curl -sI "https://nextjs-middleware-debugging.vercel.app/page/edge?mutation=set-header&name=foo&value=bar" \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -sI "http://localhost:3000/api/node?mutation=set-header&name=foo&value=bar" \
&& echo "\n\nProd\n" \
&& curl -sI "https://nextjs-middleware-debugging.vercel.app/api/node?mutation=set-header&name=foo&value=bar" \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -sI "http://localhost:3000/api/edge?mutation=set-header&name=foo&value=bar" \
&& echo "\n\nProd\n" \
&& curl -sI "https://nextjs-middleware-debugging.vercel.app/api/edge?mutation=set-header&name=foo&value=bar"
```

**Results**

For dev and prod, the response header is always set as expected.

**Command to investigate request headers for the rewrite**

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/node?mutation=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node?mutation=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/edge?mutation=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge?mutation=set-header&name=foo&value=bar" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/node?mutation=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node?mutation=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/edge?mutation=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge?mutation=set-header&name=foo&value=bar" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

**Results**

For dev, all endpoints do not receive an additional request header as expected.

For prod, edge endpoints do not receive an additional request header as expected.

For prod, node endpoints unexpectedly receive an additional request header.

## Set a cookie

```
echo "/page/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/node?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/page/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/page/edge?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | awk -F '---' '{ print $2 }' | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/node route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/node?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\n\n/api/edge route\n\n" \
&& echo "Dev\n" \
&& curl -s "http://localhost:3000/api/edge?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));' \
&& echo "\n\nProd\n" \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge?mutation=set-cookie&name=foo&value=bar" -H "Cookie: bar=baz" | node -r fs -e 'console.log(JSON.stringify(JSON.parse(fs.readFileSync("/dev/stdin", "utf-8")), null, 2));'
```

❌✅
