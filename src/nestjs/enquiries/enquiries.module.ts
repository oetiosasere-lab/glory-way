import { Module } from "@nestjs/common";
import { EnquiriesService } from "./enquiries.service";

@Module({
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
