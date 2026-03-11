import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

export function createProvider(docId: string, ydoc: Y.Doc, token: string) {
    return new HocuspocusProvider({
        url: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? 'ws://localhost:1234',
        name: docId,
        document: ydoc,
        token,
    })
}
