import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { Order } from "@/lib/supabase";

class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Order[]> {
    this.logger.log("Retrieving all customer drink orders through NestJS service");
    return this.supabaseService.getOrders();
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    this.logger.log(`Creating customer order for ${orderData.customer_name} through NestJS`);
    return this.supabaseService.createOrder(orderData);
  }

  async updateStatus(id: string, status: Order["status"], notes?: string): Promise<void> {
    this.logger.log(`Updating order ${id} status to ${status} via NestJS`);
    return this.supabaseService.updateOrderStatus(id, status, notes);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing order ${id} via NestJS`);
    return this.supabaseService.deleteOrder(id);
  }
}

Injectable()(OrdersService);
export { OrdersService };
