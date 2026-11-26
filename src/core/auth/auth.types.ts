import { UserRole, UserStatus } from '@prisma/client';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  company: string;
  contact: string;
  status: UserStatus;
  role: UserRole;
};

export type AccessClaims = {
  sub: string;
  role: UserRole;
  status: UserStatus;
  familyId: string;
};