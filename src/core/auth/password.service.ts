import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

const MIN_PASSWORD_LENGTH = 12;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    this.assertPasswordStrength(password);
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  assertPasswordStrength(password: string): void {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('password_too_short');
    }
  }
}