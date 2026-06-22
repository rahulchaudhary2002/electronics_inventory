import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ShieldOff } from 'lucide-react';
import PosShell from '@/components/pos-shell';

export default function Error() {
    const { t } = useTranslation();
    const { status } = usePage().props as { status: number };

    const is403 = status === 403;

    return (
        <PosShell>
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/20">
                    <ShieldOff className="h-7 w-7 text-rose-400" />
                </div>
                <p className="text-4xl font-black text-slate-600">{status}</p>
                <h1 className="mt-2 text-sm font-black text-slate-200">
                    {is403 ? 'Access Denied' : 'Something went wrong'}
                </h1>
                <p className="mt-1.5 text-xs text-slate-500">
                    {is403
                        ? 'You do not have permission to access this page.'
                        : 'An unexpected error occurred.'}
                </p>
                <Link
                    href="/menu"
                    className="mt-6 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700"
                >
                    ← Back to Menu
                </Link>
            </div>
        </PosShell>
    );
}
