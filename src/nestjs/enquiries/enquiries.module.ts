import { Module } from "@nestjs/common";
import { EnquiriesService } from "./enquiries.service";

class EnquiriesModule {}

Module({
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})(EnquiriesModule);

export { EnquiriesModule };
