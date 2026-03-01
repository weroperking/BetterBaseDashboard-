# BetterBase Dashboard

<p align="center">
  <img src="https://betterbase.com/logo.svg" alt="BetterBase Logo" width="200"/>
</p>

<p align="center">
  <a href="https://github.com/betterbase/betterbase-dashboard/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/betterbase/betterbase-dashboard/ci.yml?branch=main&label=Build" alt="Build Status"/>
  </a>
  <a href="https://github.com/betterbase/betterbase-dashboard/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/betterbase/betterbase-dashboard?label=Apache-2.0" alt="Apache-2.0"/>
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-14.2-black" alt="Next.js"/>
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6" alt="TypeScript"/>
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC" alt="Tailwind CSS"/>
  </a>
</p>

BetterBase Dashboard is a comprehensive admin dashboard for [BetterBase](https://betterbase.com) — a powerful backend-as-a-service (BaaS) platform similar to Supabase. It provides a complete interface for managing your project's database, authentication, storage, edge functions, and more.

## Overview

BetterBase Dashboard offers a modern, intuitive interface for managing all aspects of your BetterBase backend project. Whether you're browsing database tables, writing SQL queries, configuring authentication providers, or monitoring API logs, this dashboard provides the tools you need to efficiently manage your application's backend infrastructure.

## Features

BetterBase Dashboard includes all the features you need to manage your backend:

### Database Management

- **Tables Management** — Browse, view, create, and manage database tables with an intuitive interface
- **SQL Editor** — Execute custom SQL queries with syntax highlighting and results visualization
- **GraphQL Management** — Configure and manage GraphQL endpoints for your API
- **RLS (Row Level Security) Policies** — Define and manage security policies at the row level
- **Database Extensions** — Enable, disable, and manage PostgreSQL extensions

### Authentication & Users

- **Users Management** — View, create, edit, and manage application users
- **Authentication Providers** — Configure OAuth providers (Google, GitHub, etc.)
- **API Keys** — Generate and manage API keys for your project

### Serverless & Integration

- **Edge Functions** — Deploy and manage serverless edge functions
- **Webhooks** — Configure incoming and outgoing webhooks for event-driven workflows
- **Real-time Subscriptions** — Monitor and manage real-time database subscriptions

### Storage

- **Storage/Bucket Management** — Create and manage file storage buckets with customizable permissions

### Monitoring & Analytics

- **API Logs** — View API request logs with filtering capabilities and visual charts
- **Dashboard** — Comprehensive overview with statistics, charts, and activity feed

## Tech Stack

BetterBase Dashboard is built with modern, production-ready technologies:

- **Framework**: [Next.js 14.2](https://nextjs.org/) (React 18)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Package Manager**: [Bun](https://bun.sh/) / npm

## Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- A BetterBase project (or [create one](https://betterbase.com))

### Installation

Clone the repository and install dependencies:

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Running the Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the dashboard.

## First-Time Setup

To connect to your BetterBase project:

1. **Launch the Dashboard** — Start the development server and navigate to `http://localhost:3000`

2. **Enter Project Credentials** — On the connection page, provide:
   - **Project URL** — Your BetterBase project URL (e.g., `https://your-project.betterbase.com`)
   - **API Key** — Your project's API key (found in Project Settings → API Keys)

3. **Connect** — Click the connect button to establish a connection

4. **Start Managing** — Once connected, you'll be redirected to the main dashboard where you can:
   - Browse and manage database tables
   - Execute SQL queries
   - Configure authentication
   - Manage storage buckets
   - Deploy edge functions
   - Monitor API logs
   - And much more!

## Project Structure

The project is organized as follows:

```
betterbase-dashboard/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Main dashboard pages
│   │   ├── api/                  # API logs & analytics
│   │   ├── auth/                 # Authentication management
│   │   │   ├── providers/        # Auth providers configuration
│   │   │   └── settings/         # Auth settings
│   │   ├── extensions/           # Database extensions
│   │   ├── functions/            # Edge functions management
│   │   ├── graphql/              # GraphQL configuration
│   │   ├── logs/                 # API logs viewer
│   │   ├── realtime/             # Real-time subscriptions
│   │   ├── rls/                  # Row Level Security policies
│   │   ├── settings/             # Project settings
│   │   ├── sql/                  # SQL editor
│   │   ├── storage/              # Storage buckets
│   │   ├── tables/               # Database tables
│   │   │   └── [tableName]/      # Individual table view
│   │   ├── webhooks/             # Webhook management
│   │   └── page.tsx              # Dashboard overview
│   ├── connect/                  # Project connection page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/landing page
├── components/                   # Reusable React components
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # Top navigation header
│   │   ├── sidebar.tsx           # Side navigation
│   │   └── page-container.tsx    # Page wrapper component
│   └── ui/                       # UI component library
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       └── ...
├── hooks/                        # Custom React hooks
│   ├── use-tables.ts
│   ├── use-users.ts
│   ├── use-keys.ts
│   ├── use-logs.ts
│   ├── use-functions.ts
│   ├── use-storage.ts
│   └── ...
├── lib/                          # Utility libraries
│   ├── betterbase-client.ts      # BetterBase API client
│   ├── store.ts                  # Zustand state management
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript type definitions
│   └── betterbase.ts
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies
```

## Architecture

BetterBase Dashboard follows a modern web application architecture:

### Meta API Pattern

The dashboard communicates with your BetterBase project through a **meta API pattern**. This means:

1. **Client-Side Communication** — The dashboard directly interfaces with your BetterBase project's API endpoints
2. **RESTful Operations** — All operations (CRUD on tables, auth management, etc.) are performed via HTTP requests to your project's API
3. **State Management** — Zustand stores the current project connection and authentication state
4. **Data Fetching** — TanStack React Query handles caching, refetching, and synchronization of server state

### Key Architectural Decisions

- **App Router** — Uses Next.js 14 App Router for server components and layouts
- **Serverless-Ready** — Can be deployed to Vercel, Netlify, or any Node.js hosting
- **Type-Safe** — Full TypeScript support with comprehensive type definitions
- **Component Library** — Custom UI components built on Radix UI primitives for accessibility

### Security Considerations

- API keys are stored in client-side state (not persisted to external storage)
- All API communication happens directly between the browser and your BetterBase project
- No intermediate proxy server required

## License

BetterBase Dashboard is open source software licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for more details.

---

<p align="center">
  Built with ❤️ by the BetterBase Team
</p>
