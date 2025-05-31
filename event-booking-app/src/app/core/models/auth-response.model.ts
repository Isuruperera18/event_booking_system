// src/app/core/models/auth-response.model.ts
import { User } from './user.model';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string; // For errors
}