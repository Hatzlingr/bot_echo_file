# WhatsApp File Echo Bot

A lightweight, robust personal WhatsApp bot built with **TypeScript** and **Baileys** that receives media messages (documents, images, videos, audio) and automatically echoes the identical file back to the original sender.

---

## Architecture & Workflows

### 1. Message Processing Workflow

```text
User sends file
      |
      v
Bot receives message
      |
      v
Detect media (ignore text-only & self-messages)
      |
      v
Identify sender dynamically (never hardcoded)
      |
      v
Download temporarily to temp/
      |
      v
Send media back to sender (preserving filename & MIME)
      |
      v
Delete temporary file (try/finally cleanup)
```

### 2. Cloud Deployment Architecture (Azure VM)

```text
                  AZURE
+---------------------------------+
|                                 |
|        Ubuntu 24.04 VM          |
|                                 |
|   +-------------------------+   |
|   |       systemd           |   |
|   |                         |   |
|   |      wa-bot.service     |   |
|   +------------+------------+   |
|                |                |
|                v                |
|          Node.js 24             |
|                |                |
|                v                |
|             Baileys             |
|                |                |
|                v                |
|             WhatsApp            |
|                                 |
+---------------------------------+
```

---

## Features

- **Multi-Media Support**: Echoes documents (PDF, DOCX, TXT), images (JPG, PNG, WebP), videos (MP4), and audio (MP3, OGG, voice notes).
- **Dynamic Sender Routing**: Responses are derived automatically from the incoming message origin; no phone numbers are hardcoded.
- **Self-Message Loop Protection**: Ignores bot-generated outgoing messages (`fromMe`) to prevent infinite echoing.
- **Session Persistence**: Uses Baileys multi-file authentication state stored in `auth/`; survives restarts without requiring re-authentication.
- **Guaranteed Cleanup**: Temporary media files are processed inside `try/finally` blocks and purged immediately after sending or on failure.
- **Flexible Pairing**: Supports terminal QR Code scanning out of the box, with optional Pairing Code authentication via `.env`.
- **Production Ready**: Full support for running 24/7 as a native Linux `systemd` daemon or with `PM2`.

---

## Tech Stack

- **Runtime**: Node.js (v20+ / v24 LTS)
- **Language**: TypeScript (NodeNext ESM)
- **WhatsApp Library**: Baileys (`@whiskeysockets/baileys`)
- **Process Management**: Linux `systemd` or `pm2`
- **Logging & Utilities**: `pino`, `qrcode-terminal`

---

## Project Structure

```text
whatsapp-file-bot/
├── src/
│   ├── index.ts           # Application entrypoint & orchestration
│   ├── whatsapp.ts        # Baileys socket lifecycle, auth, reconnection
│   ├── messageHandler.ts  # Message validation, media detection, sender ID
│   ├── mediaHandler.ts    # Media downloading, payload construction, echo
│   └── fileManager.ts     # Temporary directory management & safe cleanup
├── auth/                  # Persisted session credentials (git-ignored)
├── temp/                  # Transient storage for media processing (git-ignored)
├── .env.example           # Configuration template
├── .gitignore             # Git ignore rules
├── package.json           # Project manifest and scripts
├── tsconfig.json          # TypeScript compiler configuration
└── README.md              # Project documentation
```

---

## Local Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20.12 or newer (v24 recommended)
- `npm` v9 or newer
- WhatsApp account on a mobile device

### 2. Installation
```bash
git clone https://github.com/Hatzlingr/bot_echo_file.git
cd bot_echo_file
npm install
```

### 3. Environment Setup (Optional)
Copy `.env.example` to `.env` if you wish to customize defaults:
```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `AUTH_DIR` | `./auth` | Directory where WhatsApp credentials are saved |
| `TEMP_DIR` | `./temp` | Directory where downloaded files are temporarily held |
| `LOG_LEVEL` | `silent` | Pino logger level for Baileys internal logs |
| `PAIRING_NUMBER` | _(empty)_ | Optional phone number (e.g. `6281234567890`) for pairing code |

### 4. Build and Run
```bash
# Build TypeScript
npm run build

# Start the bot
npm start

# Or compile and run in one command
npm run dev
```

### 5. Link WhatsApp
- By default, a QR code will render in the terminal.
- Open **WhatsApp** on your phone > **Settings / Linked Devices** > **Link a Device**.
- Scan the QR code. Once authenticated, the bot logs:
  ```text
  [INFO] Authentication successful
  [INFO] Bot ready
  ```

---

## Production Deployment (Azure VM / Linux VPS)

### 1. Prepare Linux Environment (Ubuntu 24.04 LTS)
```bash
sudo apt update && sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone and Build
```bash
git clone https://github.com/Hatzlingr/bot_echo_file.git ~/whatsapp-bot
cd ~/whatsapp-bot
npm install
npm run build
```

### 3. First-Time Authentication
Run the bot manually once in your SSH terminal:
```bash
npm start
```
Scan the QR code displayed in the terminal. After `[INFO] Bot ready` appears, stop the process with `Ctrl + C`. The credentials will be safely preserved in `~/whatsapp-bot/auth/`.

---

### Option A: Native `systemd` Service (Recommended)

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/wa-bot.service
   ```
2. Paste the following configuration:
   ```ini
   [Unit]
   Description=WhatsApp File Echo Bot
   After=network.target

   [Service]
   Type=simple
   User=azureuser
   WorkingDirectory=/home/azureuser/whatsapp-bot
   ExecStart=/usr/bin/node /home/azureuser/whatsapp-bot/dist/index.js
   Restart=always
   RestartSec=5s
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable wa-bot
   sudo systemctl start wa-bot
   ```
4. Useful `systemd` commands:
   ```bash
   # Check service status
   sudo systemctl status wa-bot

   # Tail live logs
   journalctl -u wa-bot -f

   # Restart or stop
   sudo systemctl restart wa-bot
   sudo systemctl stop wa-bot
   ```

---

### Option B: Using PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start bot in background
cd ~/whatsapp-bot
pm2 start dist/index.js --name "wa-bot"

# Enable auto-start on server boot
pm2 save
pm2 startup
```

Useful PM2 commands:
```bash
pm2 status
pm2 logs wa-bot
pm2 restart wa-bot
```

---

## Switching or Resetting WhatsApp Accounts

To link a new or different WhatsApp number:
1. Stop the bot (`sudo systemctl stop wa-bot` or `pm2 stop wa-bot`).
2. Delete the `auth` directory:
   ```bash
   rm -rf auth/
   ```
3. Run `npm start` to generate a fresh QR code and scan with the new account.
4. Restart your service (`sudo systemctl start wa-bot` or `pm2 start wa-bot`).

---

## License

ISC License. Built for personal use and automation.