// packages/database/src/services/files.ts
// Files database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';

// Basic file interfaces
export interface DatabaseFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mime_type: string;
  hash: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class FilesService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  // File operations
  async createFile(fileData: Omit<DatabaseFile, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseFile> {
    const result = await this.client(
      `INSERT INTO files (name, path, size, mime_type, hash, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        fileData.name,
        fileData.path,
        fileData.size,
        fileData.mime_type,
        fileData.hash,
        fileData.status
      ]
    );
    return extractFirstRow(result) as unknown as DatabaseFile;
  }

  async getFileById(id: string): Promise<DatabaseFile | null> {
    const result = await this.client('SELECT * FROM files WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as DatabaseFile | null;
  }

  async getFileByPath(path: string): Promise<DatabaseFile | null> {
    const result = await this.client('SELECT * FROM files WHERE path = $1', [path]);
    return extractFirstRow(result) as unknown as DatabaseFile | null;
  }

  async getFileByHash(hash: string): Promise<DatabaseFile | null> {
    const result = await this.client('SELECT * FROM files WHERE hash = $1', [hash]);
    return extractFirstRow(result) as DatabaseFile | null;
  }

  async getAllFiles(): Promise<DatabaseFile[]> {
    const result = await this.client('SELECT * FROM files ORDER BY created_at DESC');
    return extractRows(result) as unknown as DatabaseFile[];
  }

  async updateFile(id: string, updates: Partial<Omit<DatabaseFile, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseFile> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE files SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as DatabaseFile;
  }

  async deleteFile(id: string): Promise<void> {
    await this.client('DELETE FROM files WHERE id = $1', [id]);
  }

  async searchFiles(searchTerm: string, limit = 50): Promise<DatabaseFile[]> {
    const result = await this.client(
      `SELECT * FROM files 
       WHERE name ILIKE $1 OR path ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return extractRows(result) as unknown as DatabaseFile[];
  }

  async getFilesByMimeType(mimeType: string): Promise<DatabaseFile[]> {
    const result = await this.client(
      'SELECT * FROM files WHERE mime_type = $1 ORDER BY created_at DESC',
      [mimeType]
    );
    return extractRows(result) as unknown as DatabaseFile[];
  }

  async getFilesByStatus(status: string): Promise<DatabaseFile[]> {
    const result = await this.client(
      'SELECT * FROM files WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return extractRows(result) as unknown as DatabaseFile[];
  }

  async getTotalFileSize(): Promise<number> {
    const result = await this.client('SELECT COALESCE(SUM(size), 0) as total_size FROM files');
    const row = extractFirstRow(result) as any;
    return parseInt(row?.total_size || '0');
  }

  async getFileCount(): Promise<number> {
    const result = await this.client('SELECT COUNT(*) as count FROM files');
    const row = extractFirstRow(result) as any;
    return parseInt(row?.count || '0');
  }
} 