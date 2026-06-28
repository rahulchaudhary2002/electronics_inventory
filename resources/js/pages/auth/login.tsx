import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, Sun, Moon } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { useAppearance } from '@/hooks/use-appearance';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 antialiased">
            <Head title={t('auth.loginBtn')} />

            {/* Decorative blur orbs */}
            <div className="pointer-events-none absolute left-10 top-10 h-44 w-44 -z-0 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 right-10 h-44 w-44 -z-0 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-sm">
                {/* Top bar */}
                <div className="mb-4 flex items-center justify-end gap-2">
                    <button
                        onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                        title={resolvedAppearance === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 transition-all hover:text-white"
                    >
                        {resolvedAppearance === 'dark'
                            ? <Sun className="h-3.5 w-3.5" />
                            : <Moon className="h-3.5 w-3.5" />}
                    </button>
                    <LanguageSwitcher />
                </div>

                {/* Logo + Title */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 transform items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-10 w-10 text-white"
                        >
                            <path
                                fillRule="evenodd"
                                d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.818a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.845-.143z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                        {t('common.appName')}
                    </h2>
                    <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        {t('common.appTagline')}
                    </p>
                </div>

                {/* Form card */}
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        {t('auth.email')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                            <Mail className="h-4 w-4" />
                                        </span>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder={t('auth.emailPlaceholder')}
                                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-3 text-xs text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            {t('auth.password')}
                                        </label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-[10px] text-indigo-400 hover:text-indigo-300"
                                                tabIndex={5}
                                            >
                                                {t('auth.forgotPassword')}
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-slate-500">
                                            <Lock className="h-4 w-4" />
                                        </span>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder={t('auth.passwordPlaceholder')}
                                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-10 text-xs text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
                                            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember me */}
                                <label className="flex cursor-pointer items-center gap-2.5">
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-700 bg-slate-900 transition-all has-[input:checked]:border-indigo-600 has-[input:checked]:bg-indigo-600">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="peer sr-only"
                                        />
                                        <Check className="hidden h-2.5 w-2.5 text-white peer-checked:block" strokeWidth={3} />
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {t('auth.rememberMe')}
                                    </span>
                                </label>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {processing && <Spinner className="h-3 w-3" />}
                                    {t('auth.loginBtn')}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                    </Form>

                    {status && (
                        <div className="text-center text-sm font-medium text-green-500">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Login.layout = null;
