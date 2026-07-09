export interface GoogleUser {
  googleId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateGoogleUserInput = Required<
  Pick<GoogleUser, "googleId" | "email">
> &
  GoogleUser;
