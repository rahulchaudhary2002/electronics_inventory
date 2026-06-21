import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import AuthCard from '@/components/auth-card';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { t } = useTranslation();

    return (
        <AuthCard title={t('auth.resetPasswordTitle')} description={t('auth.resetPasswordDesc')}>
            <Head title={t('auth.resetPasswordTitle')} />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('auth.emailLabel')}</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                readOnly
                                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-400"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('auth.newPassword')}</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoFocus
                                    autoComplete="new-password"
                                    placeholder={t('auth.newPassword')}
                                    passwordrules={passwordRules}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-4 pr-10 text-xs text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300">
                                    {showPassword
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />
                                    }
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('auth.confirmPasswordLabel')}</label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder={t('auth.confirmPasswordLabel')}
                                    passwordrules={passwordRules}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-4 pr-10 text-xs text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300">
                                    {showConfirm
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />
                                    }
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                        >
                            {processing && <Spinner className="h-3 w-3" />}
                            {t('auth.resetPasswordTitle')}
                        </button>
                    </>
                )}
            </Form>
        </AuthCard>
    );
}
