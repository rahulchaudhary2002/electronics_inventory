import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

export function useAuth(): Auth {
    return usePage().props.auth as Auth;
}
