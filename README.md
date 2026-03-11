# Real-Time Document Sync 📝⚡

A collaborative, real-time document editing application built with Next.js, TipTap, Yjs, and Supabase. It allows multiple users to edit the same document simultaneously with live cursor tracking and presence features.

## 🚀 Features

- **Real-Time Collaboration**: Edit documents simultaneously with multiple users.
- **Live Cursors & Presence**: See who is currently viewing and editing the document in real-time.
- **Rich Text Editing**: Powered by TipTap for a seamless, modern editing experience.
- **Conflict Resolution**: Yjs ensures that changes from multiple distributed clients are merged correctly without data loss.
- **Secure Authentication**: User authentication and session management handled via Supabase Auth.
- **Custom WebSocket Server**: Uses Hocuspocus for high-performance, real-time document state synchronization.
- **Modern UI**: Styled with Tailwind CSS and accessible components from shadcn/ui.

## 🔄 Current Progress (Update 2)

- **SSR Compatibility**: Fixed initial document render hydration errors by dynamically importing the TiTap editor component to ensure client-side only execution.
- **Enhanced Authentication**: Transitioned to `@supabase/ssr` to ensure secure browser cookie management during the login/signup flow, along with automated registration fallbacks.
- **Robust WebSocket Server**: Reconfigured the Node.js `Hocuspocus` WebSocket server to effectively catch binding errors and execute background connection promises properly.

## 🛠️ Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/aaaditt/real-time-docsync.git
   cd real-time-docsync
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` or `.env` file in the root directory and add your Supabase credentials alongside any other necessary variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Add any other required environment variables here
   ```

4. **Start the Next.js development server:**

   ```bash
   npm run dev
   ```

5. **Start the WebSocket (Hocuspocus) Server:**
   In a separate terminal window, start the collaborative server:

   ```bash
   npx tsx server/hocuspocus.ts
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- **`app/`**: Next.js App Router structure including pages (dashboard, docs) and API routes (authentication callbacks).
- **`components/`**: Reusable React components ranging from UI primitives (`ui/`) to complex logic (`editor/`).
- **`lib/`**: Configuration and utility functions, including Supabase client initialization and Yjs provider setup.
- **`server/`**: Custom WebSocket backend configurations to handle real-time sync using Hocuspocus.

## 🔑 Technologies Used

- **Framework**: Next.js, React
- **Editor Engine**: TipTap, ProseMirror
- **Real-time Sync**: Yjs, Hocuspocus
- **Backend as a Service**: Supabase (Database, Auth, Realtime)
- **Styling**: Tailwind CSS, shadcn/ui

Built with ❤️ for seamless team collaboration.
