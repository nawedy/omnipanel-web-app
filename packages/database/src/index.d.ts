// packages/database/src/index.d.ts
// TypeScript declarations for @omnipanel/database package

import type { DatabaseConfig } from '@omnipanel/config';

// Core client types
export interface DatabaseClient {
  query: (sql: string, params?: any[]) => Promise<any>;
  transaction: (queries: Array<{ sql: string; params?: any[] }>) => Promise<any[]>;
  close: () => Promise<void>;
}

export interface DatabasePool {
  query: (sql: string, params?: any[]) => Promise<any>;
  end: () => Promise<void>;
}

export interface Database {
  client: DatabaseClient;
  pool?: DatabasePool;
}

// Service interface
export interface DatabaseService {
  client: DatabaseClient;
  pool?: any;
  testConnection: () => Promise<boolean>;
  getHealth: () => Promise<any>;
}

// Core functions
export declare function getNeonClient(config?: DatabaseConfig): (sql: string, params?: any[]) => Promise<any>;
export declare function extractFirstRow(result: any): any;
export declare function extractRows(result: any): any[];
export declare function createDatabaseService(config: DatabaseConfig): DatabaseService;
export declare function getDatabaseClient(config?: DatabaseConfig): DatabaseClient;
export declare function initializeDatabase(config: DatabaseConfig): { client: DatabaseClient; pool?: DatabasePool };
export declare function testDatabaseConnection(): Promise<boolean>;
export declare function getDatabaseHealth(): Promise<any>;

// Repository classes
export declare class UserRepository {
  constructor(client: DatabaseClient);
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export declare class ProjectRepository {
  constructor(client: DatabaseClient);
  findById(id: string): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export declare class MessageRepository {
  constructor(client: DatabaseClient);
  findById(id: string): Promise<any>;
  findBySessionId(sessionId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export declare class FileRepository {
  constructor(client: DatabaseClient);
  findById(id: string): Promise<any>;
  findByProjectId(projectId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

// Service classes
export declare class AnalyticsService {
  constructor(config?: DatabaseConfig);
  trackEvent(eventData: any): Promise<any>;
  getBasicMetrics(startDate: string, endDate: string): Promise<any>;
  getPageMetrics(startDate: string, endDate: string, limit?: number): Promise<any[]>;
  getUserActivity(userId: string, limit?: number): Promise<any[]>;
  getSessionEvents(sessionId: string): Promise<any[]>;
  getRealTimeMetrics(): Promise<any>;
  searchEvents(query: string, eventType?: string, userId?: string, startDate?: string, endDate?: string, limit?: number): Promise<any[]>;
}

export declare class SalesService {
  constructor(config?: DatabaseConfig);
  createSale(saleData: any): Promise<any>;
  getSaleById(id: string): Promise<any>;
  getSalesByCustomer(customerId: string): Promise<any[]>;
  updateSale(id: string, updates: any): Promise<any>;
  deleteSale(id: string): Promise<void>;
  createCustomer(customerData: any): Promise<any>;
  getCustomerById(id: string): Promise<any>;
  getCustomerByEmail(email: string): Promise<any>;
  updateCustomer(id: string, updates: any): Promise<any>;
  createProduct(productData: any): Promise<any>;
  getProductById(id: string): Promise<any>;
  getAllProducts(): Promise<any[]>;
  updateProduct(id: string, updates: any): Promise<any>;
  getSalesMetrics(startDate: string, endDate: string): Promise<any>;
  getTopProducts(limit?: number): Promise<any[]>;
  getTopCustomers(limit?: number): Promise<any[]>;
  searchSales(searchTerm: string, limit?: number): Promise<any[]>;
  getSalesByDateRange(startDate: string, endDate: string): Promise<any[]>;
}

// Type exports
export type { DatabaseConfig } from '@omnipanel/config';

// Analytics types
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  session_id?: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsMetrics {
  total_events: number;
  unique_users: number;
  sessions: number;
  page_views: number;
}

export interface PageMetrics {
  page: string;
  views: number;
  unique_visitors: number;
  bounce_rate: number;
}

// Sales types
export interface Sale {
  id: string;
  customer_id: string;
  product_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SalesMetrics {
  total_sales: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  period_start: string;
  period_end: string;
} 