import { proto, WASocket } from '@whiskeysockets/baileys';

export type SupportedMediaType = 'document' | 'image' | 'video' | 'audio';

export interface DetectedMedia {
  type: SupportedMediaType;
  mimetype: string;
  filename?: string;
  mediaMessage:
    | proto.Message.IDocumentMessage
    | proto.Message.IImageMessage
    | proto.Message.IVideoMessage
    | proto.Message.IAudioMessage;
}

/**
 * Unwraps message payload from various WhatsApp container wrappers
 * (ephemeral messages, view-once, document with caption, etc.).
 */
export function unwrapMessage(msg?: proto.IMessage | null): proto.IMessage | null {
  if (!msg) return null;

  if (msg.ephemeralMessage?.message) {
    return unwrapMessage(msg.ephemeralMessage.message);
  }
  if (msg.viewOnceMessage?.message) {
    return unwrapMessage(msg.viewOnceMessage.message);
  }
  if (msg.viewOnceMessageV2?.message) {
    return unwrapMessage(msg.viewOnceMessageV2.message);
  }
  if (msg.documentWithCaptionMessage?.message) {
    return unwrapMessage(msg.documentWithCaptionMessage.message);
  }

  return msg;
}

/**
 * Inspects an unwrapped message and returns detected media metadata,
 * or null if the message contains no supported media (e.g. text-only).
 */
export function detectMedia(msg?: proto.IMessage | null): DetectedMedia | null {
  if (!msg) return null;

  if (msg.documentMessage) {
    return {
      type: 'document',
      mimetype: msg.documentMessage.mimetype || 'application/octet-stream',
      filename: msg.documentMessage.fileName || undefined,
      mediaMessage: msg.documentMessage
    };
  }

  if (msg.imageMessage) {
    return {
      type: 'image',
      mimetype: msg.imageMessage.mimetype || 'image/jpeg',
      filename: undefined,
      mediaMessage: msg.imageMessage
    };
  }

  if (msg.videoMessage) {
    return {
      type: 'video',
      mimetype: msg.videoMessage.mimetype || 'video/mp4',
      filename: undefined,
      mediaMessage: msg.videoMessage
    };
  }

  if (msg.audioMessage) {
    return {
      type: 'audio',
      mimetype: msg.audioMessage.mimetype || 'audio/ogg',
      filename: undefined,
      mediaMessage: msg.audioMessage
    };
  }

  return null;
}

/**
 * Derives the sender JID from an incoming message.
 * Returns null if the message originated from the bot itself or is a broadcast.
 */
export function getSenderJid(msg: proto.IWebMessageInfo): string | null {
  // Self-message protection: never respond to own messages
  if (!msg.key || msg.key.fromMe) {
    return null;
  }

  const jid = msg.key.remoteJid;
  if (!jid || jid === 'status@broadcast' || jid.endsWith('@broadcast')) {
    return null;
  }

  return jid;
}

export type MediaCallback = (
  sock: WASocket,
  msg: proto.IWebMessageInfo,
  senderJid: string,
  media: DetectedMedia
) => Promise<void>;

/**
 * Handles incoming messages event ('messages.upsert').
 * Detects media, validates origin, ignores text-only and self messages,
 * and logs media metadata.
 */
export async function handleIncomingMessages(
  sock: WASocket,
  upsert: { messages: proto.IWebMessageInfo[]; type: string },
  onMediaDetected?: MediaCallback
): Promise<void> {
  // Only process notification events for incoming messages
  if (upsert.type !== 'notify') {
    return;
  }

  for (const msg of upsert.messages) {
    try {
      // 1. Detect self-generated messages
      if (!msg.key || msg.key.fromMe) {
        continue;
      }

      // 2. Identify sender
      const sender = getSenderJid(msg);
      if (!sender) {
        continue;
      }

      // 3. Unwrap message content
      const unwrapped = unwrapMessage(msg.message);
      if (!unwrapped) {
        continue;
      }

      // 4. Detect media
      const media = detectMedia(unwrapped);
      if (!media) {
        // FR-002: Ignore text-only messages
        continue;
      }

      // 5. Log basic media metadata per FR-009
      console.log('[INFO] Media received');
      console.log(`[INFO] Sender: ${sender}`);
      console.log(`[INFO] Type: ${media.type}`);
      if (media.filename) {
        console.log(`[INFO] Filename: ${media.filename}`);
      }
      console.log(`[INFO] MIME type: ${media.mimetype}`);

      // Pass to media processor callback if registered (for Phase 4 & 5)
      if (onMediaDetected) {
        await onMediaDetected(sock, msg, sender, media);
      }
    } catch (error) {
      // FR-008: Individual message failure must never crash the bot
      console.error('[ERROR] Error handling incoming message:', error);
    }
  }
}
