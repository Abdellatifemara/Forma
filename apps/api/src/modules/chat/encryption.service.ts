import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Server-side encryption service for chat messages
 * Messages are encrypted at rest and in transit
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;
  private readonly masterKey: Buffer;

  constructor() {
    // In production, this should come from environment variable
    const envKey = process.env.CHAT_ENCRYPTION_KEY;
    if (envKey && envKey.length >= 32) {
      this.masterKey = Buffer.from(envKey.slice(0, 32));
    } else {
      // Generate a deterministic key from a seed (for development)
      this.masterKey = crypto
        .createHash('sha256')
        .update('forma-chat-encryption-key-v1')
        .digest();
    }
  }

  /**
   * Derive a unique key for each conversation
   */
  private deriveConversationKey(conversationId: string): Buffer {
    return crypto
      .createHmac('sha256', this.masterKey)
      .update(`conversation:${conversationId}`)
      .digest();
  }

  /**
   * Encrypt a message
   */
  encrypt(message: string, conversationId: string): string {
    try {
      const key = this.deriveConversationKey(conversationId);
      const iv = crypto.randomBytes(this.ivLength);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(message, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      const authTag = cipher.getAuthTag();

      // Combine IV + AuthTag + Encrypted
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'base64'),
      ]);

      return `enc:${combined.toString('base64')}`;
    } catch {
      // Return original if encryption fails
      return message;
    }
  }

  /**
   * Decrypt a message
   */
  decrypt(encryptedMessage: string, conversationId: string): string {
    try {
      if (!encryptedMessage.startsWith('enc:')) {
        return encryptedMessage; // Not encrypted
      }

      const data = Buffer.from(encryptedMessage.slice(4), 'base64');
      const key = this.deriveConversationKey(conversationId);

      const iv = data.subarray(0, this.ivLength);
      const authTag = data.subarray(this.ivLength, this.ivLength + this.authTagLength);
      const encrypted = data.subarray(this.ivLength + this.authTagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      return '[Encrypted message]';
    }
  }

  /**
   * Check if message is encrypted
   */
  isEncrypted(message: string): boolean {
    return message.startsWith('enc:');
  }
}
