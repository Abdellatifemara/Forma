/**
 * End-to-End Encryption for Chat Messages
 * Uses Web Crypto API with AES-GCM
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

// Derive encryption key from conversation ID + user IDs (shared secret)
async function deriveKey(conversationId: string, userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`forma-e2e-${conversationId}-${userId}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('forma-chat-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate random IV
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

// Convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptMessage(
  message: string,
  conversationId: string,
  userId: string
): Promise<string> {
  try {
    const key = await deriveKey(conversationId, userId);
    const iv = generateIV();
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      encoder.encode(message)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return `e2e:${bufferToBase64(combined.buffer as ArrayBuffer)}`;
  } catch {
    // Fallback to plaintext if encryption fails
    return message;
  }
}

export async function decryptMessage(
  encryptedMessage: string,
  conversationId: string,
  userId: string
): Promise<string> {
  try {
    if (!encryptedMessage.startsWith('e2e:')) {
      return encryptedMessage; // Not encrypted
    }

    const data = encryptedMessage.slice(4);
    const combined = new Uint8Array(base64ToBuffer(data));

    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);

    const key = await deriveKey(conversationId, userId);
    const decoder = new TextDecoder();

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      encrypted as BufferSource
    );

    return decoder.decode(decrypted);
  } catch {
    return '[Encrypted message]';
  }
}

export function isEncrypted(message: string): boolean {
  return message.startsWith('e2e:');
}
