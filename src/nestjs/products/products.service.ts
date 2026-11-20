import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { Product } from "@/lib/supabase";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Product[]> {
    this.logger.log("Retrieving products from warehouse inventory via NestJS");
    return this.supabaseService.getProducts();
  }

  async save(product: Omit<Product, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<Product> {
    this.logger.log(`Saving product ${product.name} via NestJS`);
    return this.supabaseService.saveProduct(product);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing product ${id} via NestJS`);
    return this.supabaseService.deleteProduct(id);
  }
}
