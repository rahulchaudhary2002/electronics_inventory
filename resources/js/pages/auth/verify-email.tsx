import { Form, Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthCard from '@/components/auth-card';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();

    return (
        <AuthCard
            title={t('auth.verifyEmailTitle')}
            description={t('auth.verifyEmailDesc')}
        >
            <Head title={t('auth.verifyEmailTitle')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-400">
                    {t('auth.emailVerificationLinkSent')}
                </div>
            )}

            <Form {...send.form()} className="space-y-4 text-center">
                {({ processing }) => (
                    <>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-60"
                        >
                            {processing && <Spinner className="h-3 w-3" />}
                            {t('auth.resendVerification')}
                        </button>

                        <TextLink href={logout()} className="block text-xs text-slate-500 hover:text-slate-300">
                            {t('auth.logoutLink')}
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthCard>
    );
}
