import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthCard from '@/components/auth-card';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState(false);
    const [code, setCode] = useState('');
    const { t } = useTranslation();

    const config = useMemo(() => {
        if (showRecoveryInput) {
            return {
                title: t('auth.recoveryCodeTitle'),
                description: t('auth.recoveryCodeDesc'),
                toggleText: t('auth.useAuthCode'),
            };
        }
        return {
            title: t('auth.twoFactorTitle'),
            description: t('auth.twoFactorDesc'),
            toggleText: t('auth.useRecoveryCode'),
        };
    }, [showRecoveryInput, t]);

    return (
        <AuthCard title={config.title} description={config.description}>
            <Head title={t('auth.twoFactorTitle')} />

            <Form
                {...store.form()}
                className="space-y-4"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('auth.recoveryCodeTitle')}</label>
                                <input
                                    name="recovery_code"
                                    type="text"
                                    placeholder={t('auth.enterRecoveryCode')}
                                    autoFocus={showRecoveryInput}
                                    required
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <InputError message={errors.recovery_code} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from({ length: OTP_MAX_LENGTH }, (_, i) => (
                                            <InputOTPSlot key={i} index={i} />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError message={errors.code} />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                        >
                            {processing && <Spinner className="h-3 w-3" />}
                            {t('twoFactor.confirm')}
                        </button>

                        <div className="text-center text-xs text-slate-500">
                            {t('auth.orYouCan')}{' '}
                            <button
                                type="button"
                                className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
                                onClick={() => { setShowRecoveryInput(!showRecoveryInput); clearErrors(); setCode(''); }}
                            >
                                {config.toggleText}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </AuthCard>
    );
}
