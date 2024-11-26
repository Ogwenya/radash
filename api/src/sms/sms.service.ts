import { Injectable } from '@nestjs/common';
import * as AfricasTalking from 'africastalking';

@Injectable()
export class SmsService {
  private africasTalking: any;

  constructor() {
    this.africasTalking = AfricasTalking({
      apiKey: process.env.AFRICAS_TALKING_API_KEY,
      username: process.env.AFRICAS_TALKING_USERNAME,
    });
  }

  async send_message(to: string[], message: string): Promise<any> {
    try {
      const result = await this.africasTalking.SMS.send({
        to,
        message,
        from: process.env.AFRICAS_TALKING_SENDER_ID,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}
