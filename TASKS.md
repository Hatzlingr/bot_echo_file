# Implementation Tasks

## Phase 1 --- Project Setup

-   [x] Initialize Node.js project.
-   [x] Configure TypeScript.
-   [x] Install current compatible Baileys package.
-   [x] Configure npm scripts.
-   [x] Create source directory.
-   [x] Create `auth/` directory.
-   [x] Create `temp/` directory.
-   [x] Create `.gitignore`.
-   [x] Create `.env.example`.
-   [x] Create initial README.
-   [x] Verify TypeScript compilation.

### Acceptance Criteria

``` text
npm install
npm run build
```

must complete successfully.

------------------------------------------------------------------------

## Phase 2 --- WhatsApp Connection

-   [x] Initialize Baileys client.
-   [x] Implement authentication.
-   [x] Implement QR/pairing flow as appropriate.
-   [x] Persist authentication state.
-   [x] Implement connection status handling.
-   [x] Implement reconnect handling.
-   [x] Add startup logs.
-   [x] Add ready-state log.

### Acceptance Criteria

-   [x] Bot can authenticate.
-   [x] Bot reaches ready/connected state.
-   [x] Restarting the application does not require authentication when
    credentials remain valid.

------------------------------------------------------------------------

## Phase 3 --- Message Detection

-   [x] Listen for incoming messages.
-   [x] Validate incoming message events.
-   [x] Identify sender.
-   [x] Detect self-generated messages.
-   [x] Ignore self-generated messages.
-   [x] Detect media messages.
-   [x] Ignore text-only messages.
-   [x] Log basic media metadata.

### Acceptance Criteria

Text:

``` text
Hello
```

is ignored.

Media:

``` text
tugas.pdf
```

is detected and logged.

------------------------------------------------------------------------

## Phase 4 --- Media Handling

-   [x] Detect document messages.
-   [x] Detect image messages.
-   [x] Detect video messages.
-   [x] Detect audio messages.
-   [x] Determine MIME type.
-   [x] Determine filename where available.
-   [x] Download media.
-   [x] Create temporary file.
-   [x] Handle download errors.

### Acceptance Criteria

At least the following can be downloaded successfully:

-   [x] PDF
-   [x] DOCX
-   [x] JPG/PNG
-   [x] MP4
-   [x] MP3

------------------------------------------------------------------------

## Phase 5 --- Echo Response

-   [x] Load temporary media.
-   [x] Create outgoing media payload.
-   [x] Send media to original sender.
-   [x] Preserve MIME type.
-   [x] Preserve filename where supported.
-   [x] Handle send errors.

### Acceptance Criteria

``` text
User → PDF → Bot → PDF → User
```

-   [x] The returned file must be valid and contain the same file content.

------------------------------------------------------------------------

## Phase 6 --- Cleanup

-   [x] Delete temporary file after success.
-   [x] Delete temporary file after failure.
-   [x] Use reliable cleanup logic.
-   [x] Handle cleanup failures without crashing the process.

### Acceptance Criteria

-   [x] After processing, no unnecessary temporary files remain.

------------------------------------------------------------------------

## Phase 7 --- Reliability

-   [x] Handle authentication failure.
-   [x] Handle connection loss.
-   [x] Reconnect when appropriate.
-   [x] Handle malformed messages.
-   [x] Handle unsupported media.
-   [x] Handle download failure.
-   [x] Handle send failure.
-   [x] Handle filesystem failure.
-   [x] Verify one failed message does not crash the bot.
-   [x] Test consecutive messages.

------------------------------------------------------------------------

## Phase 8 --- Testing

### Basic

-   [x] Text message.
-   [x] PDF.
-   [x] DOCX.
-   [x] JPG.
-   [x] PNG.
-   [x] MP4.
-   [x] MP3.
-   [x] Multiple files consecutively.

### Reliability

-   [x] Restart bot.
-   [x] Verify authentication persistence.
-   [x] Disconnect/reconnect network.
-   [x] Test failed media download.
-   [x] Test failed media send.
-   [x] Verify cleanup after failure.
-   [x] Verify bot does not process its own response.

------------------------------------------------------------------------

## Phase 9 --- Documentation

-   [x] Document installation.
-   [x] Document environment setup.
-   [x] Document authentication.
-   [x] Document development commands.
-   [x] Document testing procedure.
-   [x] Document project structure.
-   [x] Document known limitations.

------------------------------------------------------------------------

## Phase 10 --- Production Deployment (Azure VM)

-   [x] Select free/low-cost hosting (Azure VM Ubuntu Standard_B1s).
-   [ ] Prepare Linux environment on Azure.
-   [ ] Configure Node.js (v20+ / v24) and git on VM.
-   [ ] Configure process manager (PM2).
-   [ ] Deploy application code to VM.
-   [ ] Persist auth safely on VM.
-   [ ] Verify 24/7 operation.
