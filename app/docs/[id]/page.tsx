import EditorComponent from "@/components/editor/EditorComponent";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

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
                <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-2">
                        <FileText className="w-7 h-7 text-destructive" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-muted-foreground text-sm">
                        You don&apos;t have permission to view this document.
                    </p>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-primary hover:underline mt-2"
                    >
                        ← Return to Dashboard
                    </Link>
                </div>
            );
        }
    }

    const title = doc?.title || "Shared Document";

    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <h1 className="text-sm font-semibold text-foreground truncate">
                                {title}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Editor */}
            <div className="flex-1">
                <EditorComponent docId={documentId} />
            </div>
        </main>
    );
}
