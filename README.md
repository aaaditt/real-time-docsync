# Real-Time DocSync — Collaborative Document Editor 📝⚡

A Google-Docs-style collaborative editor that lets multiple users create, edit, and sync documents in real time. Built with Next.js 16, TipTap, Yjs (CRDT), Hocuspocus WebSocket server, and Supabase for auth + persistence.

## 🚀 Features

- **Real-Time Collaboration**: Multiple users can edit the same document simultaneously — changes appear instantly across all connected clients via Yjs CRDTs.
- **Live Cursors & Presence**: See each collaborator's cursor position and name in real time, with unique color indicators.
- **Rich Text Toolbar**: Full formatting toolbar powered by TipTap — headings (H1/H2/H3), bold, italic, strikethrough, inline code, bullet & ordered lists, blockquotes, and horizontal rules.
- **Document Dashboard**: A clean dashboard to:
  - Create new documents with custom titles.
  - View all owned documents at a glance.
  - See relative timestamps ("3m ago", "2h ago") for last edits.
- **Secure Authentication**: Email/password login with automatic registration fallback, powered by Supabase Auth and `@supabase/ssr` for cookie-based session management.
- **Access Control**: Server-side owner/collaborator checks — only authorized users can view or edit a document.
- **Persistent Document State**: Yjs document state is encoded and stored in Supabase (base64), so documents survive server restarts and reconnects.
- **Connection Status**: Visual Wi-Fi indicator shows live sync status (connected / connecting).
- **SSR-Safe Editor**: The TipTap editor is dynamically imported (`ssr: false`) to prevent hydration mismatches.

## 🛠️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/aaaditt/real-time-docsync.git
cd real-time-docsync
npm install
```

### 2. Supabase Project
Create a project at [supabase.com](https://supabase.com) and set up the following tables:

- **`documents`** — `id (uuid, PK)`, `title (text)`, `owner_id (uuid, FK → auth.users)`, `ydoc_state (text)`, `created_at`, `updated_at`
- **`document_collaborators`** — `document_id (uuid, FK)`, `user_id (uuid, FK)`, `role (text)`
- **`profiles`** *(optional)* — `id (uuid, FK → auth.users)`, `full_name (text)`, `color (text)`

### 3. Environment Variables
Create a `.env` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_HOCUSPOCUS_URL=ws://localhost:1234
```

### 4. Run Everything
Start both the Next.js dev server and the Hocuspocus WebSocket server with a single command:
```bash
npm run dev:all
```
Or run them separately:
```bash
npm run dev        # Next.js on http://localhost:3000
npm run server     # Hocuspocus on ws://localhost:1234
```

Open [http://localhost:3000](http://localhost:3000) to start editing.

## 📂 Project Structure

```
real-time-docsync/
├── app/
│   ├── auth/callback/route.ts   # OAuth / magic-link callback handler
│   ├── dashboard/page.tsx       # Document list + create new doc
│   ├── docs/[id]/page.tsx       # Single document editor page
│   ├── login/page.tsx           # Login / register page
│   ├── layout.tsx               # Root layout (Inter font, metadata)
│   ├── globals.css              # Global styles
│   └── page.tsx                 # Landing / redirect
├── components/
│   ├── auth/LoginForm.tsx       # Email + password auth form
│   ├── editor/
│   │   ├── Editor.tsx           # Main TipTap editor with toolbar, cursors, presence
│   │   ├── EditorComponent.tsx  # Dynamic import wrapper (SSR-safe)
│   │   └── ActiveUsers.tsx      # Connected-users avatar strip
│   └── ui/                      # shadcn/ui primitives (button, input, avatar, dialog)
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client (@supabase/ssr)
│   │   ├── server.ts            # Server Supabase client (cookies)
│   │   └── middleware.ts        # Session refresh + auth guard middleware
│   ├── yjs/provider.ts          # Hocuspocus provider factory
│   └── utils.ts                 # Utility helpers (cn)
├── server/
│   └── hocuspocus.js            # Node.js WebSocket server (auth, load, store)
├── middleware.ts                 # Next.js middleware entry point
├── next.config.ts               # Webpack fallbacks for Yjs
└── package.json                 # Scripts: dev, server, dev:all
```

## 🔑 Configuration

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_HOCUSPOCUS_URL` | WebSocket URL for Hocuspocus (default: `ws://localhost:1234`) |

## 🔧 Technologies Used

| Layer | Stack |
|---|---|
| **Framework** | Next.js 16, React 19 |
| **Editor** | TipTap, ProseMirror |
| **Real-time Sync** | Yjs (CRDT), Hocuspocus WebSocket Server |
| **Backend** | Supabase (Postgres, Auth, Realtime) |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Tooling** | TypeScript, ESLint, Concurrently |

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start Next.js dev server |
| `server` | `npm run server` | Start Hocuspocus WebSocket server |
| `dev:all` | `npm run dev:all` | Start both servers concurrently |
| `build` | `npm run build` | Production build |
| `lint` | `npm run lint` | Run ESLint |

---

Built with ❤️ for seamless real-time collaboration.
