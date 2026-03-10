"use client";

import { useEffect, useState, useMemo } from "react";
import * as Y from "yjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { createYjsProvider } from "@/lib/yjs/provider";
import { ActiveUsers } from "@/components/editor/ActiveUsers";

interface EditorProps {
    documentId: string;
}

export function Editor({ documentId }: EditorProps) {
    const [status, setStatus] = useState("connecting");

    // Create YDoc and Provider only once per documentId
    const { yDoc, provider } = useMemo(() => {
        const doc = new Y.Doc();
        const prov = createYjsProvider(doc, documentId);
        return { yDoc: doc, provider: prov };
    }, [documentId]);

    // Store current users extracted from the Yjs Awareness instance
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        provider.on('status', (event: any) => {
            // y-supabase emits status events
            if (event && event.status) {
                setStatus(event.status);
            }
        });

        // Listen for standard Yjs Provider awareness updates
        const awareness = provider.awareness;

        const updateUsers = () => {
            const states = Array.from(awareness.getStates().values());
            // The TipTap extension structures current user under `.user`
            const activeUsers = states
                .filter((state: any) => state.user)
                .map((state: any) => state.user);

            // Deduplicate by name just in case a user has multiple tabs
            const uniqueUsers = Array.from(new Map(activeUsers.map(user => [user.name, user])).values());
            setUsers(uniqueUsers);
        };

        awareness.on('change', updateUsers);
        awareness.on('update', updateUsers);

        return () => {
            awareness.off('change', updateUsers);
            awareness.off('update', updateUsers);
            provider.destroy();
            yDoc.destroy();
        };
    }, [provider, yDoc]);

    // Setup TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
            } as any),
            Collaboration.configure({
                document: yDoc,
            }),
            CollaborationCursor.configure({
                provider: provider,
                user: {
                    name: `User ${Math.floor(Math.random() * 100)}`,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0')
                },
            }),
        ],
        content: "",
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white mt-10">
            <div className="border-b px-4 py-2 bg-slate-50 text-sm text-slate-500 font-medium flex justify-between items-center">
                <span>Live Document: {documentId}</span>
                <div className="flex items-center gap-4">
                    <ActiveUsers users={users} />
                    <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="capitalize">{status}</span>
                    </div>
                </div>
            </div>
            <div className="p-8 min-h-[600px] prose prose-slate max-w-none focus:outline-none">
                <EditorContent editor={editor} className="focus:outline-none outline-none" />
            </div>
        </div>
    );
}
