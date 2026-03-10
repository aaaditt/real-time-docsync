import * as Y from "yjs";
import { SupabaseProvider } from "y-supabase";
import { supabase } from "@/lib/supabase/client";

/**
 * Initialize a y-supabase Provider for a specific document.
 */
export const createYjsProvider = (yDoc: Y.Doc, documentId: string) => {
    return new SupabaseProvider(yDoc, supabase, {
        channel: documentId,
        tableName: 'document_updates',
        columnName: 'document_update',
    });
};
