# ETLEVA deployment configuration

## Vercel frontend

Create a Vercel project with the repository's `client` directory as its root. Vercel can use the existing Vite configuration:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

Set this project environment variable for every environment where the deployed frontend runs:

- `VITE_API_URL`: the Render service URL followed by `/api` (for example, `https://<render-service-host>/api`). This value is public because Vite embeds `VITE_` variables in browser code. It must contain only the public API URL; never put database credentials, `JWT_SECRET`, or other server secrets in Vercel variables.

Production builds fail with a configuration error if `VITE_API_URL` is missing or malformed. Local Vite development continues to default to `http://localhost:5000/api` when the variable is not set. The API client accepts a backend root or a URL ending in `/api`, and avoids adding `/api` twice.

## Render backend

Create a Render Node web service with the repository's `server` directory as its root:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`

These use the existing scripts: `build` runs TypeScript compilation and `start` runs `node dist/server.js`. The server listens on Render's `PORT`. The Prisma client is already generated under `server/src/generated/prisma`; the current build and start commands do not run Prisma generation or migrations.

Configure these server-side environment variables in Render:

- `NODE_ENV=production`
- `CLIENT_URL`: the exact Vercel frontend origin, such as `https://<vercel-project-domain>` (origin only: no path, query, or hash).
- `DATABASE_URL`: the Neon PostgreSQL connection string used by the runtime `PrismaPg` adapter. Use the Neon connection URL appropriate for the running service; a pooled Neon URL is suitable for the application runtime.
- `JWT_SECRET`: the existing backend signing secret, kept only in Render.

The Prisma 7 CLI configuration also reads `DIRECT_URL`. Add it as a Render server-side variable if you run Prisma CLI commands such as `prisma migrate deploy`; use the appropriate Neon direct connection URL. The current Render build/start commands do not invoke Prisma CLI or apply migrations. No migration was run as part of this setup.

The backend allows the configured `CLIENT_URL` and `http://localhost:5173`; requests without an `Origin` header remain allowed for health checks and server-to-server calls. Other browser origins are rejected. `/api/health` checks the service, while `/api/health/db` checks database connectivity.

## Deployment verification

After configuring the services, deploy them manually and verify `/api/health`, `/api/health/db`, CORS from the deployed Vercel origin, login, catalogue loading, and an order flow. Builds in this workspace do not verify connectivity to the actual Render or Neon resources.
