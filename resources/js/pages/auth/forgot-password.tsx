import { Form, Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthCard from '@/components/auth-card';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();

    return (
        <AuthCard
            title={t('auth.forgotPasswordTitle')}
            description={t('auth.forgotPasswordDesc')}
        >
            <Head title={t('auth.forgotPasswordTitle')} />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-400">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="space-y-4">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {t('auth.email')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder={t('auth.emailPlaceholder')}
                                className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 px-4 text-xs text-slate-200 placeholder-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                        >
                            {processing && <Spinner className="h-3 w-3" />}
                            {t('auth.sendResetLink')}
                        </button>
                    </>
                )}
            </Form>

            <div className="mt-4 text-center text-xs text-slate-500">
                {t('auth.orReturnTo')}{' '}
                <TextLink href={login()} className="text-indigo-400 hover:text-indigo-300">
                    {t('auth.backToLogin')}
                </TextLink>
            </div>
        </AuthCard>
    );
}
