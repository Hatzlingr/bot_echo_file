import fs from 'node:fs';
import path from 'node:path';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { handleIncomingMessages, MediaCallback } from './messageHandler.js';

export interface WhatsAppClientOptions {
  authDir?: string;
  pairingNumber?: string;
  onSocketReady?: (sock: WASocket) => void;
  onMediaDetected?: MediaCallback;
}

let activeSocket: WASocket | null = null;
let isReconnecting = false;

/**
 * Initializes and connects to WhatsApp using Baileys.
 */
export async function createWhatsAppClient(options: WhatsAppClientOptions = {}): Promise<WASocket> {
  const authDir = options.authDir || process.env.AUTH_DIR || './auth';
  const pairingNumber = options.pairingNumber || process.env.PAIRING_NUMBER;

  // Ensure auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log('[INFO] Starting WhatsApp bot');
  console.log('[INFO] Loading authentication credentials...');

  const { state, saveCreds } = await useMultiFileAuthState(path.resolve(authDir));
  const { version } = await fetchLatestBaileysVersion();

  console.log(`[INFO] Using WhatsApp Web version: ${version.join('.')}`);
  console.log('[INFO] Connecting');

  // Internal Baileys logger silenced to keep terminal readable per SPEC.md FR-009
  const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60000
  });

  activeSocket = sock;

  // Persist authentication state changes
  sock.ev.on('creds.update', saveCreds);

  // Listen for incoming messages and handle media detection
  sock.ev.on('messages.upsert', async (upsert) => {
    await handleIncomingMessages(sock, upsert, options.onMediaDetected);
  });

  // Pairing code flow (if phone number provided and not registered yet)
  if (!state.creds.registered && pairingNumber) {
    const cleanedNumber = pairingNumber.replace(/[^0-9]/g, '');
    if (cleanedNumber) {
      setTimeout(async () => {
        try {
          console.log(`[INFO] Requesting pairing code for ${cleanedNumber}...`);
          const code = await sock.requestPairingCode(cleanedNumber);
          console.log(`[INFO] WhatsApp Pairing Code: ${code}`);
          console.log('[INFO] Enter this code in WhatsApp -> Linked Devices -> Link with phone number');
        } catch (error) {
          console.error('[ERROR] Failed to obtain pairing code:', error);
        }
      }, 3000);
    }
  }

  // Handle connection status and reconnection
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Display QR Code if pairing number was not provided
    if (qr && (!pairingNumber || !pairingNumber.trim())) {
      console.log('\n[INFO] Scan the QR code below using WhatsApp (Linked Devices / Perangkat Tertaut):');
      qrcode.generate(qr, { small: true });
      console.log('[INFO] Waiting for QR code scan...\n');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`[WARN] Connection closed (code: ${statusCode ?? 'unknown'})`);

      if (shouldReconnect) {
        if (!isReconnecting) {
          isReconnecting = true;
          console.log('[INFO] Reconnecting in 3 seconds...');
          setTimeout(async () => {
            isReconnecting = false;
            try {
              await createWhatsAppClient(options);
            } catch (err) {
              console.error('[ERROR] Reconnection attempt failed:', err);
            }
          }, 3000);
        }
      } else {
        console.log('[ERROR] Logged out from WhatsApp. Clear the auth directory to link a new session.');
      }
    } else if (connection === 'open') {
      console.log('[INFO] Authentication successful');
      console.log('[INFO] Bot ready');

      if (options.onSocketReady) {
        options.onSocketReady(sock);
      }
    }
  });

  return sock;
}

/**
 * Returns currently active socket instance if available.
 */
export function getActiveSocket(): WASocket | null {
  return activeSocket;
}
