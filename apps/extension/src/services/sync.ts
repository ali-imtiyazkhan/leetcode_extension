import * as Y from 'yjs';
import { SyncMessage } from '@leetcode-collab/types';

export class SyncService {
  private ydoc: Y.Doc;
  private ytext: Y.Text;
  private slug: string;
  private onUpdateCallback: (update: Uint8Array) => void;

  constructor(slug: string, onUpdate: (update: Uint8Array) => void) {
    this.slug = slug;
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('monaco');
    this.onUpdateCallback = onUpdate;

    this.ydoc.on('update', (update, origin) => {
      if (origin !== 'remote') {
        this.onUpdateCallback(update);
      }
    });
  }

  public applyUpdate(update: Uint8Array) {
    Y.applyUpdate(this.ydoc, update, 'remote');
  }

  public getText(): Y.Text {
    return this.ytext;
  }

  public getDoc(): Y.Doc {
    return this.ydoc;
  }
}
