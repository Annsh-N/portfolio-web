# Engineering Notebook

This repository contains Annsh Navle's personal engineering site. The public surface is intentionally small:

- a home page with a short introduction and compact experience notes;
- project essays grounded in design decisions, tests, and measurements;
- technical notebook entries;
- shareable Wordle and Connections builders; and
- a delayed, read-only Kalshi telemetry surface.

The client is a React and TypeScript application built with Vite. An Express server serves the production bundle,
stores expiring game configurations, and exposes a narrow public telemetry endpoint. Project and writing content is
kept in `client/src/content/siteContent.ts` so it can be reviewed alongside the interface.

## Development

```sh
npm install
npm run dev
```

The client runs on port 5173 and proxies API requests to the server on port 8787.

Before publishing:

```sh
npm run check
npm run lint
npm run build
NODE_ENV=production npm run start --workspace server
```

## Public Kalshi snapshot

The portfolio process does not connect to a trading account. Instead, the bot may atomically write a sanitized JSON
snapshot and expose its path through `KALSHI_PUBLIC_SNAPSHOT_PATH`:

```sh
KALSHI_PUBLIC_SNAPSHOT_PATH=/var/lib/portfolio/kalshi-public.json
```

The accepted shape is shown in `server/data/kalshi-public.example.json`. The server validates and whitelists every
field. Credentials, balances, positions, contract identifiers, order details, model inputs, and strategy parameters
do not belong in this file. When the file is missing or invalid, the public dashboard reports an offline feed.

The producer should write a temporary file and rename it over the published path so readers never observe a partial
JSON document.

## Production boundary

The intended deployment keeps the Node process bound to a private loopback port behind a TLS-terminating reverse
proxy. The proxy serves the public domain, applies request limits, and forwards only the portfolio application. Game
state is local and disposable; links expire after seven days. Private trading telemetry and control remain in a
separate authenticated service.
