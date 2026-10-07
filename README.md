# WhatsApp File Echo Bot

A lightweight personal WhatsApp bot that receives a file/media message and automatically echoes the same file back to the original sender.

## Core Workflow

```text
User sends file
      ↓
Bot receives message
      ↓
Detect media (ignore text-only & self-messages)
      ↓
Identify sender dynamically
      ↓
Download temporarily
      ↓
Send media back to sender
      ↓
Delete temporary file (try/finally)
```

## Tech Stack

- **Node.js** (v20+ recommended, tested on v24)
- **TypeScript**
- **Baileys** (`@whiskeysockets/baileys`)
- **qrcode-terminal** (for terminal QR code display)
- **pino** (lightweight logging)
- **Local Filesystem** (for session persistence & temporary file processing)

---

## Project Structure

```text
whatsapp-file-bot/
├── src/
│   ├── index.ts           # Application entrypoint & orchestration
│   ├── whatsapp.ts        # Baileys client lifecycle, auth, reconnection
│   ├── messageHandler.ts  # Message validation, media detection, sender identification
│   ├── mediaHandler.ts    # Media downloading, echo payload building, sending
│   └── fileManager.ts     # Temporary directory management & safe cleanup
├── auth/                  # Persisted WhatsApp session credentials (git-ignored)
├── temp/                  # Temporary storage for processing files (git-ignored)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore configuration
├── package.json           # Node.js project manifest & scripts
├── tsconfig.json          # TypeScript compiler configuration
├── README.md              # Documentation & usage guide
├── SPEC.md                # System specification
├── TASKS.md               # Task tracking & milestones
└── AGENTS.md              # Coding guidelines & agent rules
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js version 20.12 or newer
- npm version 9 or newer
- A WhatsApp account on a mobile device

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd "Bot Whatsapp"
npm install
```

### 3. Environment Configuration (Optional)
Copy `.env.example` to `.env` if you want to customize settings:
```bash
cp .env.example .env
```

Available variables:
- `AUTH_DIR`: Directory for session credentials (default: `./auth`)
- `TEMP_DIR`: Directory for temporary files (default: `./temp`)
- `LOG_LEVEL`: Baileys internal log level (`silent`, `info`, `debug`, default: `silent`)
- `PAIRING_NUMBER`: (Optional) Phone number with country code for pairing code flow instead of QR code.

---

## Authentication Flow

### Method A: Terminal QR Code (Default & Recommended)
1. Run `npm run dev` in your terminal.
2. A QR code will be rendered in the terminal.
3. Open WhatsApp on your phone:
   - Go to **Settings** / Three Dots menu > **Linked Devices (Perangkat Tertaut)** > **Link a Device (Tautkan Perangkat)**.
   - Scan the QR code.
4. The terminal will log:
   ```text
   [INFO] Authentication successful
   [INFO] Bot ready
   ```
5. Session files are automatically saved to `auth/`. Subsequent bot startups will reconnect automatically without requiring a new scan.

### Method B: Pairing Code
1. Set `PAIRING_NUMBER=628xxxxxxxxx` in your `.env` file.
2. Run `npm run dev`.
3. The terminal will output an 8-character pairing code.
4. Enter this pairing code into your phone via WhatsApp > Linked Devices > Link with phone number.

---

## Available Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Compiles TypeScript and starts the bot |
| `npm run build` | Compiles TypeScript code from `src/` to `dist/` |
| `npm start` | Runs the compiled bot directly from `dist/index.js` |

---

## Testing & Verification Procedure

1. **Verify Text Messages are Ignored**:
   - Send `Hello` or any plain text to the bot.
   - The bot receives the message and ignores it without replying.
2. **Verify Media Files are Echoed**:
   - Send a document (e.g. `tugas.pdf` or `.docx`), image (`.jpg`/`.png`), video (`.mp4`), or audio/voice note.
   - Bot detects the media type, downloads it to `temp/`, and immediately sends the identical file back.
3. **Verify Temporary File Cleanup**:
   - Inspect the `temp/` directory during and after processing.
   - The file is deleted automatically upon completion or error.
4. **Verify Loop Protection**:
   - The bot checks `msg.key.fromMe` and will never process its own outgoing messages.
5. **Verify Reconnection**:
   - If internet disconnects or restarts, the bot automatically attempts reconnection in 3 seconds.

---

## Known Limitations

- **Personal Scope**: Designed as a personal lightweight file echo bot; not intended for high-concurrency public SaaS usage.
- **Local Storage**: Auth session and temporary media rely on the local filesystem.
- **WhatsApp Web Rate Limits**: Standard WhatsApp Web rate limits and fair-use policies apply. Avoid spamming large media files rapidly to prevent temporary number flagging.
