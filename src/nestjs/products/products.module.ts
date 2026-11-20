import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";

class ProductsModule {}

Module({
  providers: [ProductsService],
  exports: [ProductsService],
})(ProductsModule);

export { ProductsModule };
