import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { Feature } from '../../core/features/feature.decorator';
import { AppException } from '../../core/errors/app.exception';
import { PasswordResetService } from './password-reset.service';

const forgotSchema = z.object({ email: z.string().email() }).strict();
const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(12).max(128),
  })
  .strict();

@Feature('password-reset')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly reset: PasswordResetService) {}

  @Post('forgot-password')
  async forgot(@Body() body: unknown) {
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid request', 400);
    }
    return this.reset.requestReset(parsed.data.email.toLowerCase());
  }

  @Post('reset-password')
  async resetPassword(@Body() body: unknown) {
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid request', 400);
    }
    return this.reset.resetPassword(parsed.data);
  }
}
