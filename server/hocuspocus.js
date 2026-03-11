require('dotenv/config')
const { Server } = require('@hocuspocus/server')
const { createClient } = require('@supabase/supabase-js')
const Y = require('yjs')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const server = new Server({
    port: 1234,

    async onAuthenticate(data) {
        const { token, documentName: docId } = data
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

    async onLoadDocument(data) {
        const { documentName: docId, document } = data
        try {
            const { data: row } = await supabase
                .from('documents')
                .select('ydoc_state')
                .eq('id', docId)
                .single()

            if (row?.ydoc_state) {
                let update
                if (typeof row.ydoc_state === 'string') {
                    // Base64 encoded string
                    update = new Uint8Array(Buffer.from(row.ydoc_state, 'base64'))
                } else if (Array.isArray(row.ydoc_state)) {
                    // Legacy: stored as JSON array of bytes
                    update = new Uint8Array(row.ydoc_state)
                } else if (row.ydoc_state instanceof Buffer || row.ydoc_state instanceof Uint8Array) {
                    update = new Uint8Array(row.ydoc_state)
                }

                if (update && update.length > 0) {
                    Y.applyUpdate(document, update)
                    console.log(`[onLoadDocument] loaded doc ${docId} (${update.length} bytes)`)
                }
            }
        } catch (err) {
            console.error('[onLoadDocument] error loading, starting fresh:', err.message)
        }
        return document
    },

    async onStoreDocument(data) {
        const { documentName: docId, document } = data
        const state = Y.encodeStateAsUpdate(document)
        const base64State = Buffer.from(state).toString('base64')

        await supabase
            .from('documents')
            .update({
                ydoc_state: base64State,
                updated_at: new Date().toISOString(),
            })
            .eq('id', docId)

        console.log(`[hocuspocus] saved doc ${docId} (${state.length} bytes)`)
    },

    onConnect() { console.log('[hocuspocus] client connected') },
    onDisconnect() { console.log('[hocuspocus] client disconnected') },
})

server.listen().then(() => {
    console.log('[hocuspocus] server running on ws://localhost:1234')
}).catch((err) => {
    console.error('[hocuspocus] failed to start:', err)
})
