# Convofy Team Chat

Convofy Team Chat is a modern, workspace-based team communication app built with Next.js, Kinde authentication, Prisma, PostgreSQL, oRPC, TanStack Query, UploadThing, Arcjet, and OpenRouter-powered AI helpers.

It combines multi-organization authentication, channel-based messaging, rich text composition, reactions, threads, member management, and AI-assisted writing into a single app-router codebase.

[Quick Start](#quick-start) | [Environment Setup](#environment-setup) | [Architecture](#architecture-overview) | [Features](#features) | [Troubleshooting](#troubleshooting) | [Development](#development)

## Why Convofy

- Build Slack-style team communication around Kinde organizations and workspaces
- Keep auth, workspace routing, server procedures, and UI inside a single Next.js app
- Use Prisma with PostgreSQL for channels, messages, threads, and emoji reactions
- Add AI-assisted message rewriting and thread summaries with OpenRouter
- Protect routes and sensitive actions with Arcjet middleware
- Upload media and attachments through UploadThing

## Features

- Workspace-based collaboration using Kinde organizations
- Channel navigation scoped to the active workspace
- Rich text message composition with TipTap-based editing
- Threaded replies and thread sidebars
- Emoji reactions on messages
- Message editing
- Image attachments
- AI message rewriting / compose assistance
- AI thread summarization
- UploadThing-powered file upload flow
- React Query hydration and oRPC server/client integration
- Arcjet-based abuse and action protection

## Tech Stack

### Frontend
- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI primitives
- TanStack Query

### Backend and data
- Prisma
- PostgreSQL
- oRPC
- Kinde Auth for Next.js
- Kinde Management API SDK

### AI and security
- OpenRouter via AI SDK
- Arcjet
- UploadThing

## Quick Start

### 1. Clone and install

```bash
git clone git@github.com:radityprtama/convofy_team-chat.git
cd convofy_team-chat
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

### 3. Start PostgreSQL

If you want a local database with Docker Compose:

```bash
docker compose up -d
```

This repo includes a local Postgres service definition in `docker-compose.yml`.

### 4. Push the Prisma schema

```bash
npx prisma db push
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Setup

Create `.env` from `.env.example` and fill in the following values.

### Required variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/teamflow?schema=public"

# Kinde Auth for Next.js
KINDE_CLIENT_ID="your_kinde_client_id"
KINDE_CLIENT_SECRET="your_kinde_client_secret"
KINDE_ISSUER_URL="https://your-subdomain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/workspace"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"

# Kinde Management API (M2M app)
KINDE_DOMAIN="your-subdomain.kinde.com"
KINDE_MANAGEMENT_CLIENT_ID="your_kinde_m2m_client_id"
KINDE_MANAGEMENT_CLIENT_SECRET="your_kinde_m2m_client_secret"

# UploadThing
UPLOADTHING_TOKEN="your_uploadthing_token"

# Arcjet
ARCJET_KEY="your_arcjet_key"

# OpenRouter / AI SDK
LLM_KEY="your_openrouter_api_key"
```

## Kinde Setup

Convofy uses two different Kinde application types.

### 1. Regular Kinde app for user authentication
Use these variables for browser login and callback handling:

- `KINDE_CLIENT_ID`
- `KINDE_CLIENT_SECRET`
- `KINDE_ISSUER_URL`
- `KINDE_SITE_URL`
- `KINDE_POST_LOGIN_REDIRECT_URL`
- `KINDE_POST_LOGOUT_REDIRECT_URL`

### 2. Machine-to-machine app for Kinde Management API
Use a separate M2M app for:

- listing organization users
- creating organizations
- adding users to organizations
- creating users through the management API

Important:
- `KINDE_DOMAIN` should be the host only, for example `teamflows-dev.au.kinde.com`
- do not include `https://` in `KINDE_DOMAIN`
- the M2M app must be authorized for the Kinde Management API audience
- the M2M app must have the required organization/user scopes enabled

If the M2M app is not whitelisted for the Kinde Management API audience, you will see errors like:

```text
Unauthorized - invalid credentials
Requested audience 'https://your-subdomain.kinde.com/api' has not been whitelisted by the OAuth 2.0 Client
```

## Local Database Setup

If you are using the local Docker Compose database, these are the usual commands:

```bash
docker compose up -d
docker compose ps
npx prisma db push
```

If Docker requires elevated privileges on your machine:

```bash
sudo docker compose up -d
```

To verify Postgres is listening:

```bash
ss -ltnp | grep ':5432'
```

## Available Scripts

```bash
npm run dev      # Start Next.js in development mode with Turbopack
npm run build    # Create a production build
npm start        # Start the production server
npm run lint     # Run ESLint
```

## Architecture Overview

### Routing
- `app/(marketing)` contains the landing page
- `app/(dashboard)/workspace` contains the authenticated workspace UI
- `app/api/auth/[kindeAuth]/route.ts` handles Kinde auth routes
- `app/rpc/[[...rest]]/route.ts` exposes oRPC procedures
- `proxy.ts` manages auth-aware workspace redirects

### Server procedures
The app uses oRPC handlers in `app/router` for core server-side operations:

- `workspace.ts` for workspace listing and creation
- `channel.ts` for channel creation and listing
- `message.ts` for message CRUD and pagination
- `member.ts` for member operations
- `ai.ts` for AI compose and thread summary flows

### Data model
Prisma models currently cover:

- `Channel`
- `Message`
- `MessageReaction`

Messages support:
- rich text content
- optional image URLs
- thread parent/reply relationships
- author metadata

## Key Application Flows

### Authentication and workspace routing
- marketing page login and signup buttons redirect into `/workspace`
- organization switching redirects into `/workspace/{orgCode}`
- `proxy.ts` normalizes workspace routes based on the active organization claim

### Messaging
- channels are scoped to a Kinde organization code
- messages are paginated with TanStack Query infinite queries
- threads are loaded from parent/reply relationships in Prisma
- reactions are unique by message, user, and emoji

### AI helpers
Convofy includes AI-assisted features powered by OpenRouter:

- rewrite and improve drafted messages
- summarize discussion threads into concise action-oriented output

The AI routes live in:

- `app/router/ai.ts`

## Repository Structure

```text
app/
  (marketing)/                Landing page and marketing UI
  (dashboard)/workspace/      Workspace shell, channels, members, messages
  api/auth/                   Kinde auth route handler
  api/uploadthing/            UploadThing route integration
  middlewares/                Auth, workspace, Arcjet middleware
  router/                     oRPC procedures
  schemas/                    Zod input schemas
components/
  ui/                         Reusable UI primitives
  rich-text-editor/           Message editor and AI compose helpers
lib/
  db.ts                       Prisma client setup
  orpc.ts                     oRPC client wiring
  query/                      TanStack Query hydration/client setup
  generated/prisma/           Generated Prisma client output
prisma/
  schema.prisma               Prisma schema source used by Prisma CLI
docker-compose.yml            Local PostgreSQL service
proxy.ts                      Workspace redirect middleware
```

## Development Notes

### Redirect behavior
The app expects Kinde redirects to land on workspace routes instead of the marketing page.

Recommended values:

```env
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/workspace"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
```

### Prisma schema updates
When you change Prisma schema or move environments:

```bash
npx prisma db push
```

If you need to regenerate the Prisma client manually:

```bash
npx prisma generate
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### 1. Prisma cannot connect to localhost:5432
Error example:

```text
P1001: Can't reach database server at localhost:5432
```

Fix:

```bash
docker compose up -d
npx prisma db push
```

If Docker permission is denied, use:

```bash
sudo docker compose up -d
```

### 2. Kinde Management API returns 403 invalid credentials
This usually means one of the following:

- you used regular Kinde app credentials instead of M2M credentials
- the M2M app is not authorized for the Kinde Management API audience
- the required organization/user scopes are missing
- `KINDE_DOMAIN` is malformed

Checklist:
- use a dedicated M2M app
- authorize the app for Kinde Management API
- enable the necessary scopes
- set `KINDE_DOMAIN` to host-only format

### 3. Login or organization switching goes back to the landing page
Check:

- `KINDE_POST_LOGIN_REDIRECT_URL`
- `LoginLink` and `RegisterLink` `postLoginRedirectURL` values
- organization switch links using `orgCode` and a workspace redirect target
- `proxy.ts` workspace redirect logic

### 4. Arcjet warns about public IP in development
In local development you may see:

```text
Arcjet will use 127.0.0.1 when missing public IP address in development mode
```

That warning is expected in local development.

## Production Notes

Before deploying, make sure you:

- use a production Postgres instance
- set production Kinde URLs and redirect URLs
- configure the Kinde M2M app in the production tenant
- set production UploadThing and Arcjet keys
- use a real OpenRouter API key for AI features

## Contributing

Contributions are welcome.

Recommended local validation before opening a PR:

```bash
npm run lint
npm run build
```

Also verify:

```bash
npx prisma db push
npm run dev
```

## License

No license file is currently included in this repository. Add one if you want to make the project usage terms explicit.
