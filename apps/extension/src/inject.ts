import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

console.log('LeetCode Collab: Injection script loaded');

const ydoc = new Y.Doc();
const ytext = ydoc.getText('monaco');

function findMonacoEditor() {
    // LeetCode's Monaco is usually accessible via monaco.editor.getModels()
    const monaco = (window as any).monaco;
    if (monaco && monaco.editor) {
        const models = monaco.editor.getModels();
        if (models.length > 0) {
            const model = models[0];
            const editors = monaco.editor.getEditors(); // May not exist in all versions
            // Better: find the active editor
            const editor = monaco.editor.getEditors().find((e: any) => e.getModel() === model) || monaco.editor.getEditors()[0];
            
            if (editor) {
                console.log('LeetCode Collab: Found Monaco editor', editor);
                return { editor, model };
            }
        }
    }
    return null;
}

let binding: MonacoBinding | null = null;

function setupBinding() {
    const res = findMonacoEditor();
    if (res) {
        const { editor, model } = res;
        binding = new MonacoBinding(ytext, model, new Set([editor]));
        console.log('LeetCode Collab: Monaco binding established');
    } else {
        setTimeout(setupBinding, 1000);
    }
}

// Communication with content script
window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'leetcode-collab-content') return;

    if (event.data.type === 'APPLY_UPDATE') {
        Y.applyUpdate(ydoc, new Uint8Array(event.data.update), 'remote');
    }
});

ydoc.on('update', (update, origin) => {
    if (origin !== 'remote') {
        window.postMessage({
            source: 'leetcode-collab-inject',
            type: 'YJS_UPDATE',
            update: Array.from(update)
        }, '*');
    }
});

setupBinding();
