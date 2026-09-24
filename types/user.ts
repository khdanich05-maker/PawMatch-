// types/user.ts
export type UserRole = 'user' | 'shelter' | 'admin';

export interface User {
    user_id: string;
    role: UserRole;
    username: string;
    password_hash?: string;
    email: string | null;
    phone: string | null;
    accommodation_type?: string | null;
    date_of_birth?: string | null;
    salary?: number | null;
    animal_count?: number;
}