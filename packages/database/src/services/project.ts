// packages/database/src/services/project.ts
// Project database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';

// Basic project interfaces
export interface DatabaseProject {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class ProjectService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  // Project operations
  async createProject(projectData: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProject> {
    const result = await this.client(
      `INSERT INTO projects (name, description, type, status, owner_id, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        projectData.name,
        projectData.description,
        projectData.type,
        projectData.status,
        projectData.owner_id,
        JSON.stringify(projectData.settings)
      ]
    );
    return extractFirstRow(result) as unknown as DatabaseProject;
  }

  async getProjectById(id: string): Promise<DatabaseProject | null> {
    const result = await this.client('SELECT * FROM projects WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as DatabaseProject | null;
  }

  async getProjectsByOwner(ownerId: string): Promise<DatabaseProject[]> {
    const result = await this.client(
      'SELECT * FROM projects WHERE owner_id = $1 ORDER BY updated_at DESC',
      [ownerId]
    );
    return extractRows(result) as unknown as DatabaseProject[];
  }

  async getAllProjects(): Promise<DatabaseProject[]> {
    const result = await this.client('SELECT * FROM projects ORDER BY created_at DESC');
    return extractRows(result) as unknown as DatabaseProject[];
  }

  async updateProject(id: string, updates: Partial<Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseProject> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE projects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as DatabaseProject;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client('DELETE FROM projects WHERE id = $1', [id]);
  }

  async searchProjects(searchTerm: string, limit = 50): Promise<DatabaseProject[]> {
    const result = await this.client(
      `SELECT * FROM projects 
       WHERE name ILIKE $1 OR description ILIKE $1
       ORDER BY updated_at DESC
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return extractRows(result) as unknown as DatabaseProject[];
  }

  async getProjectsByType(type: string): Promise<DatabaseProject[]> {
    const result = await this.client(
      'SELECT * FROM projects WHERE type = $1 ORDER BY created_at DESC',
      [type]
    );
    return extractRows(result) as unknown as DatabaseProject[];
  }

  async getProjectsByStatus(status: string): Promise<DatabaseProject[]> {
    const result = await this.client(
      'SELECT * FROM projects WHERE status = $1 ORDER BY updated_at DESC',
      [status]
    );
    return extractRows(result) as unknown as DatabaseProject[];
  }

  async getProjectCount(): Promise<number> {
    const result = await this.client('SELECT COUNT(*) as count FROM projects');
    const row = extractFirstRow(result) as any;
    return parseInt(row?.count || '0');
  }

  async getProjectCountByOwner(ownerId: string): Promise<number> {
    const result = await this.client('SELECT COUNT(*) as count FROM projects WHERE owner_id = $1', [ownerId]);
    const row = extractFirstRow(result) as any;
    return parseInt(row?.count || '0');
  }
} 