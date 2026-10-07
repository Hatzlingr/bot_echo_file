import fs from 'node:fs';
import {
  downloadMediaMessage,
  downloadContentFromMessage,
  proto,
  WASocket,
  MediaType,
  WAMessage
} from '@whiskeysockets/baileys';
import { DetectedMedia, SupportedMediaType } from './messageHandler.js';
import { saveBufferToTemp, deleteTempFile } from './fileManager.js';

/**
 * Maps MIME types or media categories to default file extensions.
 */
function getDefaultExtension(type: SupportedMediaType, mimetype: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/3gpp': '3gp',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg'
  };

  if (mimeMap[mimetype]) {
    return mimeMap[mimetype];
  }

  switch (type) {
    case 'document':
      return 'bin';
    case 'image':
      return 'jpg';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
    default:
      return 'bin';
  }
}

/**
 * Downloads media from a WhatsApp message into a Buffer.
 * Tries downloadMediaMessage first, with fallback to downloadContentFromMessage.
 */
export async function downloadMedia(
  msg: proto.IWebMessageInfo,
  media: DetectedMedia
): Promise<Buffer> {
  try {
    const buffer = await downloadMediaMessage(
      msg as WAMessage,
      'buffer',
      {},
      undefined
    );
    return buffer as Buffer;
  } catch {
    // Fallback: download directly from stream
    const stream = await downloadContentFromMessage(
      media.mediaMessage as any,
      media.type as MediaType
    );
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
  }
}

/**
 * Sends the media file back to the original sender.
 */
export async function sendEchoMedia(
  sock: WASocket,
  senderJid: string,
  filePath: string,
  media: DetectedMedia
): Promise<void> {
  const fileBuffer = await fs.promises.readFile(filePath);

  switch (media.type) {
    case 'document':
      await sock.sendMessage(senderJid, {
        document: fileBuffer,
        mimetype: media.mimetype,
        fileName: media.filename || 'file'
      });
      break;

    case 'image':
      await sock.sendMessage(senderJid, {
        image: fileBuffer,
        mimetype: media.mimetype
      });
      break;

    case 'video':
      await sock.sendMessage(senderJid, {
        video: fileBuffer,
        mimetype: media.mimetype
      });
      break;

    case 'audio':
      await sock.sendMessage(senderJid, {
        audio: fileBuffer,
        mimetype: media.mimetype,
        ptt: false
      });
      break;
  }
}

/**
 * Core media processing pipeline:
 * try { download -> save to temp -> echo to sender } finally { cleanup temp }
 */
export async function processAndEchoMedia(
  sock: WASocket,
  msg: proto.IWebMessageInfo,
  senderJid: string,
  media: DetectedMedia
): Promise<void> {
  let tempFilePath: string | null = null;

  try {
    console.log('[INFO] Downloading media');
    const buffer = await downloadMedia(msg, media);

    console.log('[INFO] Saving to temporary storage');
    const fallbackExt = getDefaultExtension(media.type, media.mimetype);
    tempFilePath = await saveBufferToTemp(buffer, media.filename, fallbackExt);

    console.log('[INFO] Sending media');
    await sendEchoMedia(sock, senderJid, tempFilePath, media);
    console.log('[INFO] Media sent successfully');
  } catch (error) {
    console.error('[ERROR] Failed to process or send media:', error);
  } finally {
    await deleteTempFile(tempFilePath);
  }
}
