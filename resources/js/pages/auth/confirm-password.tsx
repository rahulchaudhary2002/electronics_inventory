import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import AuthCard from '@/components/auth-card';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();

    return (
        <AuthCard
            title={t('auth.confirmPasswordTitle')}
            description={t('auth.confirmPasswordDesc')}
        >
            <Head title={t('auth.confirmPasswordTitle')} />

            <div className="mb-4">
                <PasskeyVerify
                    routes={{
                        options: confirmOptions(),
                        submit: confirmStore(),
                    }}
                    label={t('auth.confirmWithPasskey')}
                    loadingLabel={t('auth.confirming')}
                    separator={t('auth.orConfirmWithPassword')}
                />
            </div>

            <Form {...store.form()} resetOnSuccess={['password']} className="space-y-4">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('auth.password')}</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoFocus
                                    autoComplete="current-password"
                                    placeholder={t('auth.passwordPlaceholder')}
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

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                        >
                            {processing && <Spinner className="h-3 w-3" />}
                            {t('auth.confirmPasswordTitle')}
                        </button>
                    </>
                )}
            </Form>
        </AuthCard>
    );
}
