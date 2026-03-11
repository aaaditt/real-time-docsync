import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, LogOut, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch documents owned by the user
    const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false });

    // Server Action to create a new Document
    const createDocument = async (formData: FormData) => {
        "use server";
        const title = (formData.get("title") as string) || "Untitled Document";
        const sb = await createClient();
        const { data: { user }, error: userError } = await sb.auth.getUser();

        if (!user) return;

        const { data: newDoc } = await sb
            .from("documents")
            .insert({ title, owner_id: user.id })
            .select()
            .single();

        if (newDoc) {
            redirect(`/docs/${newDoc.id}`);
        }
    };

    // Server Action to sign out
    const signOut = async () => {
        "use server";
        const sb = await createClient();
        await sb.auth.signOut();
        redirect("/login");
    };

    // Helper to format relative time
    function timeAgo(dateStr: string): string {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString();
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground tracking-tight">DocSync</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            {user.email}
                        </span>
                        <form action={signOut}>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign out</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Page heading + create form */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            My Documents
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {documents?.length ?? 0} document{documents?.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <form action={createDocument} className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            name="title"
                            placeholder="Document title…"
                            className="flex-1 sm:w-56 h-10 border border-border bg-card rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
                        />
                        <Button type="submit" className="gap-2 h-10 px-4 cursor-pointer">
                            <PlusCircle className="w-4 h-4" />
                            Create
                        </Button>
                    </form>
                </div>

                {/* Document Grid */}
                {documents && documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                            <Link
                                href={`/docs/${doc.id}`}
                                key={doc.id}
                                className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/[0.04] transition-all duration-200"
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {doc.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {timeAgo(doc.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card/50">
                        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-muted mb-4">
                            <FileText className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-medium">No documents yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create your first document to get started.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
