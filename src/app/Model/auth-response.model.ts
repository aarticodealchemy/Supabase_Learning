export interface IdentityData {
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  sub?: string;
  userName?: string;
  [key: string]: unknown;
}

export interface UserIdentity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data?: IdentityData;
  provider: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  email?: string;
}

export interface AppMetadata {
  provider?: string;
  providers?: string[];
  [key: string]: unknown;
}

export interface UserMetadata {
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  sub?: string;
  userName?: string;
  [key: string]: unknown;
}

export interface SupabaseAuthUser {
  id: string;
  aud: string;
  role: string;
  email?: string;
  phone?: string;
  confirmation_sent_at?: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities?: UserIdentity[];
  created_at: string;
  updated_at?: string;
  is_anonymous?: boolean;
}
