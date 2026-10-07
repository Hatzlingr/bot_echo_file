import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Gets the configured temporary directory, creating it if it does not exist.
 */
export function getTempDir(): string {
  const tempDir = process.env.TEMP_DIR || './temp';
  const resolved = path.resolve(tempDir);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

/**
 * Saves a buffer to a unique temporary file and returns its absolute path.
 */
export async function saveBufferToTemp(
  buffer: Buffer,
  originalFilename?: string,
  fallbackExtension = 'bin'
): Promise<string> {
  const tempDir = getTempDir();
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();

  let safeName: string;
  if (originalFilename) {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    safeName = `${timestamp}_${uniqueId}_${basename}${ext || '.' + fallbackExtension}`;
  } else {
    safeName = `${timestamp}_${uniqueId}.${fallbackExtension}`;
  }

  const filePath = path.join(tempDir, safeName);
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Deletes a temporary file safely. Logs warning on error without crashing.
 */
export async function deleteTempFile(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`[INFO] Temporary file deleted: ${path.basename(filePath)}`);
    }
  } catch (error) {
    // AGENTS.md rule 11: Cleanup errors should be logged without crashing the bot
    console.warn(`[WARN] Failed to delete temporary file ${filePath}:`, error);
  }
}
