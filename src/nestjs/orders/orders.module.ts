import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";

class OrdersModule {}

Module({
  providers: [OrdersService],
  exports: [OrdersService],
})(OrdersModule);

export { OrdersModule };
