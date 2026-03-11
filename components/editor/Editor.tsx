'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { supabase } from '@/lib/supabase/client'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo2,
    Redo2,
    Heading1,
    Heading2,
    Heading3,
    Loader2,
    Wifi,
    WifiOff,
    Users,
} from 'lucide-react'

interface EditorProps {
    docId: string
}

interface AwarenessUser {
    id: string
    name: string
    color: string
}

const COLORS = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#14b8a6', // teal
]

export default function Editor({ docId }: EditorProps) {
    const [currentUser, setCurrentUser] = useState<AwarenessUser | null>(null)
    const [isSynced, setIsSynced] = useState(false)
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null)
    const [connectedUsers, setConnectedUsers] = useState<AwarenessUser[]>([])
    const ydocRef = useRef<Y.Doc | null>(null)

    // Create ydoc + provider
    useEffect(() => {
        const doc = new Y.Doc()
        ydocRef.current = doc

        const hocusProvider = new HocuspocusProvider({
            url: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? 'ws://localhost:1234',
            name: docId,
            document: doc,
            token: async () => {
                const { data } = await supabase.auth.getSession()
                return data.session?.access_token ?? ''
            },
            onSynced() {
                setIsSynced(true)
            },
        })

        // Track connected users via awareness
        const awareness = hocusProvider.awareness
        if (awareness) {
            const updateUsers = () => {
                const states = awareness.getStates()
                const users: AwarenessUser[] = []
                states.forEach((state) => {
                    if (state.user) {
                        users.push(state.user as AwarenessUser)
                    }
                })
                setConnectedUsers(users)
            }

            awareness.on('change', updateUsers)
        }

        setProvider(hocusProvider)

        return () => {
            hocusProvider.destroy()
            doc.destroy()
            setProvider(null)
            setIsSynced(false)
            setConnectedUsers([])
        }
    }, [docId])

    // Load user awareness info
    useEffect(() => {
        if (!provider) return

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

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ history: false }),
            Placeholder.configure({
                placeholder: 'Start writing…',
            }),
            ...(provider && ydocRef.current
                ? [
                    Collaboration.configure({ document: ydocRef.current }),
                    CollaborationCursor.configure({
                        provider,
                        user: currentUser ?? { name: '…', color: '#6366f1' },
                    }),
                ]
                : []),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none min-h-[calc(100vh-7rem)] px-8 py-6 focus:outline-none',
            },
        },
    }, [provider, currentUser])

    // Toolbar button helper
    const ToolbarButton = useCallback(({ onClick, isActive, children, title }: {
        onClick: () => void
        isActive?: boolean
        children: React.ReactNode
        title: string
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`
                flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer
                ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
            `}
        >
            {children}
        </button>
    ), [])

    // Unique users (deduplicated by id)
    const uniqueUsers = connectedUsers.filter(
        (u, i, arr) => arr.findIndex(x => x.id === u.id) === i
    )

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="sticky top-12 z-10 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-10 flex items-center justify-between">
                    {/* Formatting controls */}
                    <div className="flex items-center gap-0.5">
                        {editor && (
                            <>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                    isActive={editor.isActive('heading', { level: 1 })}
                                    title="Heading 1"
                                >
                                    <Heading1 className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                    isActive={editor.isActive('heading', { level: 2 })}
                                    title="Heading 2"
                                >
                                    <Heading2 className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                    isActive={editor.isActive('heading', { level: 3 })}
                                    title="Heading 3"
                                >
                                    <Heading3 className="w-4 h-4" />
                                </ToolbarButton>

                                <div className="w-px h-5 bg-border mx-1" />

                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    isActive={editor.isActive('bold')}
                                    title="Bold (Ctrl+B)"
                                >
                                    <Bold className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    isActive={editor.isActive('italic')}
                                    title="Italic (Ctrl+I)"
                                >
                                    <Italic className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                    isActive={editor.isActive('strike')}
                                    title="Strikethrough"
                                >
                                    <Strikethrough className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleCode().run()}
                                    isActive={editor.isActive('code')}
                                    title="Inline Code"
                                >
                                    <Code className="w-4 h-4" />
                                </ToolbarButton>

                                <div className="w-px h-5 bg-border mx-1" />

                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    isActive={editor.isActive('bulletList')}
                                    title="Bullet List"
                                >
                                    <List className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    isActive={editor.isActive('orderedList')}
                                    title="Ordered List"
                                >
                                    <ListOrdered className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    isActive={editor.isActive('blockquote')}
                                    title="Blockquote"
                                >
                                    <Quote className="w-4 h-4" />
                                </ToolbarButton>
                                <ToolbarButton
                                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                    title="Horizontal Rule"
                                >
                                    <Minus className="w-4 h-4" />
                                </ToolbarButton>
                            </>
                        )}
                    </div>

                    {/* Right side: users + sync status */}
                    <div className="flex items-center gap-3">
                        {/* Active users avatars */}
                        {uniqueUsers.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                <div className="flex -space-x-1.5">
                                    {uniqueUsers.slice(0, 5).map((u, i) => (
                                        <div
                                            key={u.id || i}
                                            className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-semibold text-white shadow-sm"
                                            style={{ backgroundColor: u.color }}
                                            title={u.name}
                                        >
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {uniqueUsers.length > 5 && (
                                        <div className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-medium bg-muted text-muted-foreground">
                                            +{uniqueUsers.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sync indicator */}
                        <div className="flex items-center gap-1.5" title={isSynced ? 'Connected' : 'Connecting…'}>
                            {isSynced ? (
                                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                                <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full">
                    {!isSynced ? (
                        <div className="flex items-center justify-center gap-2 h-32 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting to document…
                        </div>
                    ) : (
                        <EditorContent editor={editor} />
                    )}
                </div>
            </div>
        </div>
    )
}
