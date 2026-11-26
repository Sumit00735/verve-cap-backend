import { Body, Controller, Post } from '@nestjs/common';
import { Feature } from '../../core/features/feature.decorator';
import { AppException } from '../../core/errors/app.exception';
import { AuthRegistrationService } from './auth-registration.service';
import { registerSchema } from './dto/register.dto';

@Feature('auth-registration')
@Controller('auth')
export class AuthRegistrationController {
  constructor(private readonly registration: AuthRegistrationService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppException('bad_request', 'Invalid registration', 400);
    }
    return this.registration.register(parsed.data);
  }
}
