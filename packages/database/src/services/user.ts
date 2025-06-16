// packages/database/src/services/user.ts
// User database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';
import type {
  DatabaseUser,
  DatabaseUserPreferences,
  DatabaseSubscriptionTier
} from '@omnipanel/types';

export class UserService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  async createUser(userData: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseUser> {
    const result = await this.client(
      `INSERT INTO users (email, name, avatar_url, subscription_tier, preferences)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userData.email,
        userData.name,
        userData.avatar_url,
        userData.subscription_tier,
        JSON.stringify(userData.preferences)
      ]
    );
    return extractFirstRow(result) as unknown as DatabaseUser;
  }

  async getUserById(id: string): Promise<DatabaseUser | null> {
    const result = await this.client(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return extractFirstRow(result) as unknown as DatabaseUser | null;
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await this.client(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return extractFirstRow(result) as unknown as DatabaseUser | null;
  }

  async updateUser(id: string, updates: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseUser> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as DatabaseUser;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client('DELETE FROM users WHERE id = $1', [id]);
  }

  async updateUserPreferences(id: string, preferences: DatabaseUserPreferences): Promise<DatabaseUser> {
    const result = await this.client(
      'UPDATE users SET preferences = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, JSON.stringify(preferences)]
    );
    return extractFirstRow(result) as unknown as DatabaseUser;
  }

  async updateSubscriptionTier(id: string, tier: DatabaseSubscriptionTier): Promise<DatabaseUser> {
    const result = await this.client(
      'UPDATE users SET subscription_tier = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, tier]
    );
    return extractFirstRow(result) as unknown as DatabaseUser;
  }

  async listUsers(limit = 50, offset = 0): Promise<DatabaseUser[]> {
    const result = await this.client(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return extractRows(result) as unknown as DatabaseUser[];
  }
} 