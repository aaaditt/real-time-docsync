"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Dynamically import the Editor component, disabling SSR entirely
// This prevents Next.js/Turbopack from trying to bundle Node-specific Yjs libraries on the server
const EditorComponent = dynamic(
    () => import("./EditorComponent").then((mod) => mod.Editor),
    {
        ssr: false,
        loading: () => (
            <div className="w-full max-w-4xl mx-auto h-[600px] mt-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ),
    }
);

export function Editor({ documentId }: { documentId: string }) {
    return (
        <Suspense fallback={null}>
            <EditorComponent documentId={documentId} />
        </Suspense>
    );
}
