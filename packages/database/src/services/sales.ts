// packages/database/src/services/sales.ts
// Sales database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';

// Basic sales interfaces
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

export class SalesService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  // Sale operations
  async createSale(saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<Sale> {
    const result = await this.client(
      `INSERT INTO sales (customer_id, product_id, amount, currency, status, payment_method, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        saleData.customer_id,
        saleData.product_id,
        saleData.amount,
        saleData.currency,
        saleData.status,
        saleData.payment_method,
        saleData.transaction_id,
        saleData.notes
      ]
    );
    return extractFirstRow(result) as unknown as Sale;
  }

  async getSaleById(id: string): Promise<Sale | null> {
    const result = await this.client('SELECT * FROM sales WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as Sale | null;
  }

  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    const result = await this.client(
      'SELECT * FROM sales WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return extractRows(result) as unknown as Sale[];
  }

  async updateSale(id: string, updates: Partial<Omit<Sale, 'id' | 'created_at' | 'updated_at'>>): Promise<Sale> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE sales SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as Sale;
  }

  async deleteSale(id: string): Promise<void> {
    await this.client('DELETE FROM sales WHERE id = $1', [id]);
  }

  // Customer operations
  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const result = await this.client(
      `INSERT INTO customers (email, name, phone, company, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        customerData.email,
        customerData.name,
        customerData.phone,
        customerData.company,
        customerData.address
      ]
    );
    return extractFirstRow(result) as unknown as Customer;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const result = await this.client('SELECT * FROM customers WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as Customer | null;
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const result = await this.client('SELECT * FROM customers WHERE email = $1', [email]);
    return extractFirstRow(result) as unknown as Customer | null;
  }

  async updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<Customer> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE customers SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as Customer;
  }

  // Product operations
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await this.client(
      `INSERT INTO products (name, description, price, currency, category, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        productData.name,
        productData.description,
        productData.price,
        productData.currency,
        productData.category,
        productData.status
      ]
    );
    return extractFirstRow(result) as unknown as Product;
  }

  async getProductById(id: string): Promise<Product | null> {
    const result = await this.client('SELECT * FROM products WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as Product | null;
  }

  async getAllProducts(): Promise<Product[]> {
    const result = await this.client('SELECT * FROM products ORDER BY name');
    return extractRows(result) as unknown as Product[];
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as Product;
  }

  // Analytics and reporting
  async getSalesMetrics(startDate: string, endDate: string): Promise<SalesMetrics> {
    const result = await this.client(
      `SELECT 
         COUNT(*) as total_sales,
         COALESCE(SUM(amount), 0) as total_revenue,
         COALESCE(AVG(amount), 0) as average_order_value,
         $1 as period_start,
         $2 as period_end
       FROM sales 
       WHERE created_at >= $1 AND created_at <= $2 AND status = 'completed'`,
      [startDate, endDate]
    );
    
    const row = extractFirstRow(result) as any;
    return {
      total_sales: parseInt(row?.total_sales || '0'),
      total_revenue: parseFloat(row?.total_revenue || '0'),
      average_order_value: parseFloat(row?.average_order_value || '0'),
      conversion_rate: 0, // Would need additional data to calculate
      period_start: startDate,
      period_end: endDate
    };
  }

  async getTopProducts(limit = 10): Promise<Array<Product & { sales_count: number; total_revenue: number }>> {
    const result = await this.client(
      `SELECT 
         p.*,
         COUNT(s.id) as sales_count,
         COALESCE(SUM(s.amount), 0) as total_revenue
       FROM products p
       LEFT JOIN sales s ON p.id = s.product_id AND s.status = 'completed'
       GROUP BY p.id
       ORDER BY total_revenue DESC, sales_count DESC
       LIMIT $1`,
      [limit]
    );
    
    return extractRows(result).map((row: Record<string, unknown>) => ({
      ...row,
      sales_count: parseInt(row.sales_count as string || '0'),
      total_revenue: parseFloat(row.total_revenue as string || '0')
    })) as unknown as Array<Product & { sales_count: number; total_revenue: number }>;
  }

  async getTopCustomers(limit = 10): Promise<Array<Customer & { total_spent: number; order_count: number }>> {
    const result = await this.client(
      `SELECT 
         c.*,
         COUNT(s.id) as order_count,
         COALESCE(SUM(s.amount), 0) as total_spent
       FROM customers c
       LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
       GROUP BY c.id
       ORDER BY total_spent DESC, order_count DESC
       LIMIT $1`,
      [limit]
    );
    
    return extractRows(result).map((row: Record<string, unknown>) => ({
      ...row,
      order_count: parseInt(row.order_count as string || '0'),
      total_spent: parseFloat(row.total_spent as string || '0')
    })) as unknown as Array<Customer & { total_spent: number; order_count: number }>;
  }

  async searchSales(searchTerm: string, limit = 50): Promise<Sale[]> {
    const result = await this.client(
      `SELECT s.* FROM sales s
       JOIN customers c ON s.customer_id = c.id
       JOIN products p ON s.product_id = p.id
       WHERE c.email ILIKE $1 OR c.name ILIKE $1 OR p.name ILIKE $1 OR s.transaction_id ILIKE $1
       ORDER BY s.created_at DESC
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return extractRows(result) as unknown as Sale[];
  }

  async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const result = await this.client(
      `SELECT * FROM sales 
       WHERE created_at >= $1 AND created_at <= $2
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );
    return extractRows(result) as unknown as Sale[];
  }
} 