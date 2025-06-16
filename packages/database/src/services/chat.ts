// packages/database/src/services/chat.ts
// Chat database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';

// Basic chat interfaces
export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  content_type: string;
  attachments?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseConversation {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class ChatService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  // Message operations
  async createMessage(messageData: Omit<DatabaseMessage, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseMessage> {
    const result = await this.client(
      `INSERT INTO messages (conversation_id, role, content, content_type, attachments)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        messageData.conversation_id,
        messageData.role,
        messageData.content,
        messageData.content_type,
        messageData.attachments
      ]
    );
    return extractFirstRow(result) as unknown as DatabaseMessage;
  }

  async getMessageById(id: string): Promise<DatabaseMessage | null> {
    const result = await this.client('SELECT * FROM messages WHERE id = $1', [id]);
    return extractFirstRow(result) as DatabaseMessage | null;
  }

  async getMessagesByConversation(conversationId: string): Promise<DatabaseMessage[]> {
    const result = await this.client(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    return extractRows(result) as unknown as DatabaseMessage[];
  }

  async updateMessage(id: string, updates: Partial<Omit<DatabaseMessage, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseMessage> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE messages SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as DatabaseMessage;
  }

  async deleteMessage(id: string): Promise<void> {
    await this.client('DELETE FROM messages WHERE id = $1', [id]);
  }

  // Conversation operations
  async createConversation(conversationData: Omit<DatabaseConversation, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseConversation> {
    const result = await this.client(
      `INSERT INTO conversations (user_id, title, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        conversationData.user_id,
        conversationData.title,
        conversationData.status
      ]
    );
    return extractFirstRow(result) as unknown as DatabaseConversation;
  }

  async getConversationById(id: string): Promise<DatabaseConversation | null> {
    const result = await this.client('SELECT * FROM conversations WHERE id = $1', [id]);
    return extractFirstRow(result) as DatabaseConversation | null;
  }

  async getConversationsByUser(userId: string): Promise<DatabaseConversation[]> {
    const result = await this.client(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return extractRows(result) as unknown as DatabaseConversation[];
  }

  async updateConversation(id: string, updates: Partial<Omit<DatabaseConversation, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseConversation> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE conversations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as DatabaseConversation;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client('DELETE FROM conversations WHERE id = $1', [id]);
  }

  async searchMessages(searchTerm: string, limit = 50): Promise<DatabaseMessage[]> {
    const result = await this.client(
      `SELECT * FROM messages 
       WHERE content ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return extractRows(result) as unknown as DatabaseMessage[];
  }
} 