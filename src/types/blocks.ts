export interface BaseBlock {
  id: string;
  type: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  doc: any; // ProseMirror JSON document
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url?: string;
  alt?: string;
  caption?: string;
}

export interface RecordLinkBlock extends BaseBlock {
  type: 'record-link';
  recordId?: string;
  recordType?: string;
  title?: string;
}

export type Block = TextBlock | ImageBlock | RecordLinkBlock;

export const createTextBlock = (content?: any): TextBlock => ({
  id: crypto.randomUUID(),
  type: 'text',
  doc: content || { type: 'doc', content: [{ type: 'paragraph' }] }
});

export const createImageBlock = (): ImageBlock => ({
  id: crypto.randomUUID(),
  type: 'image',
  url: '',
  alt: '',
  caption: ''
});

export const createRecordLinkBlock = (): RecordLinkBlock => ({
  id: crypto.randomUUID(),
  type: 'record-link',
  recordId: '',
  recordType: '',
  title: ''
});