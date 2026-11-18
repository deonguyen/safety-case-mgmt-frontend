This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3002 with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment & Configuration Guidelines

This application handles different environments (**Development**, **stage**, and **Production**) and their associated `.env` files.

### 1. Environment Files Setup

Before running the application, ensure you have the appropriate environment files created in the root directory. Never commit secrets to version control (ensure these are added to `.gitignore`).

*   **`.env.dev`**: Used for local development.
*   **`.env.stage`**: Used for the stage environment.
*   **`.env.prod`**: Used for the live production environment.

---

### 2. Running Locally (Without Docker)

Next.js natively supports `.env.development` and `.env.production`. For local development and stage, we use `env-cmd` to explicitly inject the correct variables.

#### Development
Runs the app in development mode with hot-reloading. Explicitly loads `.env.dev`.
```bash
npm run dev
```

#### stage
Creates a production-like build but explicitly forces the injection of variables from `.env.stage`.
```bash
# Build the app using stage variables
npm run build:stage

# Start the compiled app using stage variables
npm run start:stage
```

#### Production
Creates the final optimized build for live deployment. Natively loads `.env.production`.
```bash
# Build the app using production variables
npm run build

# Start the compiled app
npm run start
```

---

## Docker Environment Build & Run Guidelines

This project includes dedicated Dockerfiles for each environment. During the build phase, these Dockerfiles automatically locate and securely bake in the appropriate `.env` file for Next.js.

*Note: Ensure your `.dockerignore` is configured correctly so local `node_modules` and `.next` folders are not copied into the stage and production builds.*

### Running with Docker Compose (Recommended)

We provide environment-specific Docker Compose files that automatically handle building, volume mounting, Envoy reverse-proxy configuration, and load balancing.

#### Port Mapping Table

| Environment | Docker Compose File | Envoy Exposed Port | Internal Container Port | Local Access URL |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | `docker-compose.dev.yml` | `3082` | `3002` | `http://localhost:3082` |
| **stage** | `docker-compose.stage.yml` | `3081` | `3001` | `http://localhost:3081` |
| **Production** | `docker-compose.prod.yml` | `3080` | `3000` | `http://localhost:3080` |

*   **Development:** `docker compose -f docker-compose.dev.yml up -d --build`
*   **stage:** `docker compose -f docker-compose.stage.yml up -d --build`
*   **Production:** `docker compose -f docker-compose.prod.yml up -d --build`

*(Note: To stop the compose environment, run `docker compose -f <filename> down`)*

---

### Manual Docker Build & Run (Alternative)

If you prefer to run standard Docker commands, follow the manual steps below.

#### 1. Development Environment
The development container is optimized for rapid iteration. It uses `npm run dev` and mounts your local source code into the container to enable Next.js hot-reloading (Fast Refresh).

**Build the Image:**
Uses `Dockerfile.dev`. It expects a `.env.dev` file locally (passed via `--build-arg ENV_FILE`) and maps it internally so Next.js can load it.
```bash
docker build -f Dockerfile.dev --build-arg ENV_FILE=.env.dev -t sq-spec-portal-frontend-dev .
```

**Run the Container:**
Because we need to sync your local file changes with the container in real-time, we use Docker volumes (`-v`). We also mount an anonymous volume for `/app/node_modules` to ensure the container uses its own Linux-compiled dependencies rather than your host machine's.

**On Mac / Linux / PowerShell:**
```bash
docker run -d -p 3082:3002 --name sq-spec-portal-frontend-dev -v "${PWD}:/app" -v /app/node_modules sq-spec-portal-frontend-dev
```

**On Windows (CMD):**
```cmd
docker run -d -p 3002:3002 --name sq-spec-portal-frontend-dev -v "%cd%:/app" -v /app/node_modules sq-spec-portal-frontend-dev
```

*Your app is now running at `http://localhost:3002`. Any changes to your local files will instantly reflect in the browser.*

#### 2. stage Environment
The stage container simulates the production environment but uses stage-specific environment variables (baked in during the build via `npm run build:stage`).

**Build the Image:**
Uses `Dockerfile.stage`. It **strictly requires** `.env.stage` to be present locally. It copies this file and safely renames it to `.env.production` internally so Next.js can bake the public stage variables into the optimized build.
```bash
docker build -f Dockerfile.stage --build-arg ENV_FILE=.env.stage -t sq-spec-portal-frontend-stage .
```

**Run the Container:**
Since the stage build uses Next.js Standalone mode, the code is fully compiled. You do not need to mount volumes. However, you should inject runtime environment variables (like your backend API host).
```bash
docker run -d -p 3001:3001 --name sq-spec-portal-frontend-stage sq-spec-portal-frontend-stage
```

#### 3. Production Environment
The production container is the highly optimized, final artifact intended for live users. It uses the standard `npm run build` command.

**Build the Image:**
Uses `Dockerfile.prod`. It copies `.env.production` to bake the public production variables into the build.
```bash
docker build -f Dockerfile.prod --build-arg ENV_FILE=.env.prod -t sq-spec-portal-frontend-prod .
```

**Run the Container:**
Similar to stage, pass the live production environment variables when running the container.
```bash
docker run -d -p 3000:3000 --name sq-spec-portal-frontend-prod sq-spec-portal-frontend-prod
```

> **Note on Runtime Secrets:** If you have server-side secrets or dynamic URLs (like a backend API host) that you don't want baked into the image, you should pass them at runtime using the `-e` flag (e.g., `docker run -d -p 3000:3000 -e DJANGO_API_HOST="https://api.com" --name sq-spec-portal-frontend-prod sq-spec-portal-frontend-prod`).

---

### Useful Docker Commands

**View the logs of a running container:**
```bash
docker logs -f sq-spec-portal-frontend-dev
```

**Stop a running container:**
```bash
docker stop sq-spec-portal-frontend-dev
```

**Access the shell inside the container (for debugging):**
```bash
docker exec -it sq-spec-portal-frontend-dev /bin/sh
```
