import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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
        const title = formData.get("title") as string || "Untitled Document";
        const sb = await createClient();
        const { data: { user } } = await sb.auth.getUser();

        if (user) {
            const { data: newDoc } = await sb
                .from("documents")
                .insert({ title, owner_id: user.id })
                .select()
                .single();

            if (newDoc) {
                // Redirect immediately to the new document
                redirect(`/docs/${newDoc.id}`);
            }
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>

                    <form action={createDocument} className="flex gap-2">
                        <input
                            type="text"
                            name="title"
                            placeholder="New document title..."
                            className="border border-slate-200 rounded-md px-3 text-sm focus:outline-slate-400"
                        />
                        <Button type="submit" className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Create
                        </Button>
                    </form>
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents?.map((doc) => (
                        <Link
                            href={`/docs/${doc.id}`}
                            key={doc.id}
                            className="block bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition cursor-pointer group hover:border-blue-200"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">{doc.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Edited {new Date(doc.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {documents?.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No documents yet. Create one above to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
