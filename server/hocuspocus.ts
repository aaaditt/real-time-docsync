import 'dotenv/config'
import { Server } from '@hocuspocus/server'
import { createClient } from '@supabase/supabase-js'
import * as Y from 'yjs'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const server = new Server({
    port: 1234,

    async onAuthenticate({ token, documentName: docId }) {
        if (!token) throw new Error('No token')
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (error || !user) throw new Error('Unauthorized')

        const { data: doc } = await supabase
            .from('documents')
            .select('id, owner_id')
            .eq('id', docId)
            .single()

        if (!doc) throw new Error('Document not found')

        const isOwner = doc.owner_id === user.id
        const { data: collab } = await supabase
            .from('document_collaborators')
            .select('role')
            .eq('document_id', docId)
            .eq('user_id', user.id)
            .single()

        if (!isOwner && !collab) throw new Error('Access denied')
        return { userId: user.id }
    },

    async onLoadDocument({ documentName: docId, document }) {
        const { data } = await supabase
            .from('documents')
            .select('ydoc_state')
            .eq('id', docId)
            .single()

        if (data?.ydoc_state) {
            Y.applyUpdate(document, new Uint8Array(data.ydoc_state))
        }
        return document
    },

    async onStoreDocument({ documentName: docId, document }) {
        const state = Y.encodeStateAsUpdate(document)
        await supabase
            .from('documents')
            .update({
                ydoc_state: Buffer.from(state),
                updated_at: new Date().toISOString(),
            })
            .eq('id', docId)
        console.log(`[hocuspocus] saved doc ${docId}`)
    },

    async onConnect() { console.log('[hocuspocus] client connected') },
    async onDisconnect() { console.log('[hocuspocus] client disconnected') },
})

server.listen()
console.log('[hocuspocus] server running on ws://localhost:1234')
