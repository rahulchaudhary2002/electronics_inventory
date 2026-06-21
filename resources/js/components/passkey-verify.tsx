import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
}: Props = {}) {
    const { t } = useTranslation();
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <>
            <div className="grid gap-2">
                <button
                    type="button"
                    onClick={verify}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 disabled:opacity-60"
                >
                    {isLoading ? <Spinner className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
                    {isLoading
                        ? (loadingLabel ?? t('passkey.authenticating'))
                        : (label ?? t('passkey.signIn'))}
                </button>
                {error && (
                    <InputError message={error} className="text-center" />
                )}
            </div>

            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-slate-900 px-3 text-slate-500">
                        {separator ?? t('passkey.orContinueWith')}
                    </span>
                </div>
            </div>
        </>
    );
}
