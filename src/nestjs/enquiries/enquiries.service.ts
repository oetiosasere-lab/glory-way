import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { Enquiry } from "@/lib/supabase";

@Injectable()
export class EnquiriesService {
  private readonly logger = new Logger(EnquiriesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<Enquiry[]> {
    this.logger.log("Retrieving customer enquiries via NestJS");
    return this.supabaseService.getEnquiries();
  }

  async create(enquiry: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    this.logger.log(`Submitting customer enquiry from ${enquiry.name} via NestJS`);
    return this.supabaseService.createEnquiry(enquiry);
  }

  async updateStatus(id: string, status: Enquiry["status"]): Promise<void> {
    this.logger.log(`Updating enquiry ${id} status to ${status} via NestJS`);
    return this.supabaseService.updateEnquiryStatus(id, status);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting enquiry ${id} via NestJS`);
    return this.supabaseService.deleteEnquiry(id);
  }
}
