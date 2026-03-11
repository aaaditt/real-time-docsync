"use client";

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('./Editor'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen text-zinc-400">
            Loading editor...
        </div>
    ),
})

export default function EditorComponent({ docId }: { docId: string }) {
    return <Editor docId={docId} />
}
