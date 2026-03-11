import EditorComponent from "@/components/editor/EditorComponent";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verify access and get title
    const { data: doc } = await supabase
        .from("documents")
        .select("title")
        .eq("id", documentId)
        .single();

    if (!doc) {
        // If we don't own it, check collaborators table
        const { data: collab } = await supabase
            .from("document_collaborators")
            .select("*")
            .eq("document_id", documentId)
            .eq("user_id", user.id)
            .single();

        if (!collab) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Access Denied</h1>
                    <p className="text-slate-500">You don't have permission to view this document.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
                </div>
            );
        }
    }

    const title = doc?.title || "Shared Document";

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 truncate max-w-md">
                        {title}
                    </h1>
                </div>
                {/* We will add share buttons here later */}
            </div>

            <EditorComponent docId={documentId} />
        </main>
    );
}
