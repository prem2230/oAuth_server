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
    avatar_url: string | null;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
}