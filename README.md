# About

This repo was built to help determine how calling NextResponse.rewrite() in Next.js impacts the Request object received at the final _endpoint_, which can be either a React Page or a API Route.

We found that there is inconsistency across development and production, and across node and edge runtimes. We detail those inconsistencies below and provide commands to reproduce.

# How to use

There are four "endpoints" in this repo:

1. /page/node
2. /page/edge
3. /api/node
4. /api/edge

The endpoints run on the runtime indicated in their path, using the Next.js [switchable runtime](https://nextjs.org/docs/advanced-features/react-18/switchable-runtime).

Page endpoints are configured to print the URL that `getServerSideProps` receives inside `context.req`. The URL is wrapped in triple hyphens (e.g. ---) for easy parsing from the command line.

API endpoints are configured to print the URL that the handler receives through the `request` parameter.

# Results

We run cURL requests against both development and production to determine their behavior. The production environment is hosted on Vercel.

## Control

This prints the request URL when endpoints are accessed directly, and middleware returns `NextResponse.next()`.

For completeness, we include a query string (?foo=bar) in the URL.

### Command

```
echo "Requesting: /page/node?foo=bar\n" \
&& echo -n "Dev context.req.url:  " \
&& curl -s "http://localhost:3000/page/node?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo -n "Prod context.req.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/node?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo "\n\nRequesting: /page/edge?foo=bar\n" \
&& echo -n "Dev context.req.url:  " \
&& curl -s "http://localhost:3000/page/edge?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo -n "Prod context.req.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/page/edge?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo "\n\nRequesting: /api/node?foo=bar\n" \
&& echo -n "Dev request.url:  " \
&& curl -s "http://localhost:3000/api/node?foo=bar" \
&& echo -n "\nProd request.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/node?foo=bar" \
&& echo "\n\nRequesting: /api/edge?foo=bar\n" \
&& echo -n "Dev request.url:  " \
&& curl -s "http://localhost:3000/api/edge?foo=bar" \
&& echo -n "\nProd request.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/api/edge?foo=bar"
```

### Results

```
Requesting: /page/node?foo=bar

Dev context.req.url:  /page/node?foo=bar
Prod context.req.url: /page/node?foo=bar


Requesting: /page/edge?foo=bar

Dev context.req.url:  /page/edge?foo=bar
Prod context.req.url: /page/edge?foo=bar


Requesting: /api/node?foo=bar

Dev request.url:  /api/node?foo=bar
Prod request.url: /api/node?foo=bar

Requesting: /api/edge?foo=bar

Dev request.url:  http://localhost:3000/api/edge?foo=bar
Prod request.url: https://nextjs-middleware-debugging.vercel.app/api/edge?foo=bar
```

With NextResponse.next() endpoints all behave consistently, with one small exception.

Edge API routes have access to the full URL, while others are missing the origin.

## Test

Instead of requesting the endpoint directly, we will access a different path (/test), and middleware will return `NextResponse.rewrite()` to forward the request to the appropriate endpoint.

For completeness, we include a query string (?foo=bar) in the rewrite URL.

### Command

```
echo "Requesting: /test?rewrite=/page/node?foo=bar\n" \
&& echo -n "Dev context.req.url:  " \
&& curl -s "http://localhost:3000/test?rewrite=/page/node?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo -n "Prod context.req.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/test?rewrite=/page/node?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo "\n\nRequesting: /test?rewrite=/page/edge?foo=bar\n" \
&& echo -n "Dev context.req.url:  " \
&& curl -s "http://localhost:3000/test?rewrite=/page/edge?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo -n "Prod context.req.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/test?rewrite=/page/edge?foo=bar" | awk -F '---' '{ print $2 }' \
&& echo "\n\nRequesting: /test?rewrite=/api/node?foo=bar\n" \
&& echo -n "Dev request.url:  " \
&& curl -s "http://localhost:3000/test?rewrite=/api/node?foo=bar" \
&& echo -n "\nProd request.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/test?rewrite=/api/node?foo=bar" \
&& echo "\n\nRequesting: /test?rewrite=/api/edge?foo=bar\n" \
&& echo -n "Dev request.url:  " \
&& curl -s "http://localhost:3000/test?rewrite=/api/edge?foo=bar" \
&& echo -n "\nProd request.url: " \
&& curl -s "https://nextjs-middleware-debugging.vercel.app/test?rewrite=/api/edge?foo=bar"
```

**Results**

```
Requesting: /test?rewrite=/page/node?foo=bar

Dev context.req.url:  /test?rewrite=/page/node?foo=bar
Prod context.req.url: /test?foo=bar


Requesting: /test?rewrite=/page/edge?foo=bar

Dev context.req.url:  /page/edge?foo=bar
Prod context.req.url: /test?foo=bar


Requesting: /test?rewrite=/api/node?foo=bar

Dev request.url:  /test?rewrite=/api/node?foo=bar
Prod request.url: /test?foo=bar

Requesting: /test?rewrite=/api/edge?foo=bar

Dev request.url:  http://localhost:3000/api/edge?foo=bar
Prod request.url: https://nextjs-middleware-debugging.vercel.app/test?foo=bar
```

_/page/node_

❌ In dev, `context.req.url` reflects the complete original request URL

✅ In prod, `context.req.url` reflects the original pathname and the rewritten query string

_/page/edge_

❌ In dev, `context.req.url` reflects the complete rewritten request URL

❌ In prod, `context.req.url` reflects the original pathname and the rewritten query string

_/api/node_

❌ In dev, `request.url` reflects the complete original request URL

❌ In prod, `request.url` reflects the original pathname and the rewritten query string

_/api/edge_

✅ In dev, `request.url` reflects the complete rewritten request URL

❌ In prod, `request.url` reflects the original pathname and the rewritten query string
