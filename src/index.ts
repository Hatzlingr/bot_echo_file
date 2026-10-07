import fs from 'node:fs';
import { createWhatsAppClient } from './whatsapp.js';
import { processAndEchoMedia } from './mediaHandler.js';

// Load environment variables if .env exists (Node.js 20+ built-in)
if (fs.existsSync('.env')) {
  process.loadEnvFile('.env');
}

async function main(): Promise<void> {
  try {
    await createWhatsAppClient({
      onMediaDetected: async (sock, msg, senderJid, media) => {
        await processAndEchoMedia(sock, msg, senderJid, media);
      }
    });
  } catch (error) {
    console.error('[ERROR] Failed to start WhatsApp client:', error);
    process.exit(1);
  }
}

main();
