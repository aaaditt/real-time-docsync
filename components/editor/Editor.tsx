'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { IndexeddbPersistence } from 'y-indexeddb'
import { supabase } from '@/lib/supabase/client'

interface EditorProps {
    docId: string
}

interface AwarenessUser {
    id: string
    name: string
    color: string
}

const COLORS = ['#e11d48', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

export default function Editor({ docId }: EditorProps) {
    const [currentUser, setCurrentUser] = useState<AwarenessUser | null>(null)
    const [isSynced, setIsSynced] = useState(false)

    const ydoc = useMemo(() => new Y.Doc(), [docId])

    const provider = useMemo(() => new HocuspocusProvider({
        url: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? 'ws://localhost:1234',
        name: docId,
        document: ydoc,
        token: async () => {
            const { data } = await supabase.auth.getSession()
            return data.session?.access_token ?? ''
        },
        onSynced() { setIsSynced(true) },
    }), [docId, ydoc])

    useEffect(() => {
        const persistence = new IndexeddbPersistence(`docsync-${docId}`, ydoc)
        return () => { persistence.destroy() }
    }, [docId, ydoc])

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, color')
                .eq('id', user.id)
                .single()

            const awarenessUser: AwarenessUser = {
                id: user.id,
                name: profile?.full_name ?? user.email ?? 'Anonymous',
                color: profile?.color ?? COLORS[Math.floor(Math.random() * COLORS.length)],
            }
            setCurrentUser(awarenessUser)
            provider.setAwarenessField('user', awarenessUser)
        }
        load()
    }, [provider])

    useEffect(() => {
        return () => {
            provider.destroy()
            ydoc.destroy()
        }
    }, [provider, ydoc])

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ history: false }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider,
                user: currentUser ?? { name: '...', color: '#aaa' },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none min-h-screen px-8 py-6 focus:outline-none',
            },
        },
    })

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
            <div className="border-b px-4 py-2 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-950 z-10">
                <span className="text-sm font-medium text-zinc-500">DocSync</span>
                <span className={`h-2 w-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`} />
            </div>
            <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
                {!isSynced && (
                    <div className="flex items-center justify-center h-24 text-sm text-zinc-400">
                        Connecting...
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
