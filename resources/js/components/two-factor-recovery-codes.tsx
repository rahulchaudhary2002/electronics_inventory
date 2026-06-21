import { Form } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertError from '@/components/alert-error';
import { regenerateRecoveryCodes } from '@/routes/two-factor';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;
    const { t } = useTranslation();

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }
        setCodesAreVisible(!codesAreVisible);
        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIcon = codesAreVisible ? EyeOff : Eye;

    return (
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center gap-2">
                <LockKeyhole className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300">{t('twoFactor.recoveryCodes')}</span>
            </div>
            <p className="mb-3 text-[10px] text-slate-500">
                {t('twoFactor.recoveryCodesDesc')}
            </p>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={toggleCodesVisibility}
                    aria-expanded={codesAreVisible}
                    aria-controls="recovery-codes-section"
                    className="flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-bold text-slate-200 transition-all hover:bg-slate-700"
                >
                    <RecoveryCodeIcon className="h-3 w-3" />
                    {codesAreVisible ? t('twoFactor.hideCodes') : t('twoFactor.viewCodes')}
                </button>

                {canRegenerateCodes && (
                    <Form
                        {...regenerateRecoveryCodes.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={fetchRecoveryCodes}
                    >
                        {({ processing }) => (
                            <button
                                type="submit"
                                disabled={processing}
                                aria-describedby="regenerate-warning"
                                className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-60"
                            >
                                <RefreshCw className="h-3 w-3" />
                                {t('twoFactor.regenerate')}
                            </button>
                        )}
                    </Form>
                )}
            </div>

            <div
                id="recovery-codes-section"
                className={`overflow-hidden transition-all duration-300 ${codesAreVisible ? 'mt-3 opacity-100' : 'h-0 opacity-0'}`}
                aria-hidden={!codesAreVisible}
            >
                {errors?.length ? (
                    <AlertError errors={errors} />
                ) : (
                    <>
                        <div
                            ref={codesSectionRef}
                            className="grid gap-1 rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-300"
                            role="list"
                            aria-label="Recovery codes"
                        >
                            {recoveryCodesList.length ? (
                                recoveryCodesList.map((code, index) => (
                                    <div key={index} role="listitem" className="select-text">{code}</div>
                                ))
                            ) : (
                                <div className="space-y-2" aria-label="Loading recovery codes">
                                    {Array.from({ length: 8 }, (_, index) => (
                                        <div key={index} className="h-3 animate-pulse rounded bg-slate-700" aria-hidden="true" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <p id="regenerate-warning" className="mt-2 text-[10px] text-slate-500 select-none">
                            {t('twoFactor.regenerateWarningPrefix')} <span className="font-bold">{t('twoFactor.regenerate')}</span> {t('twoFactor.regenerateWarningSuffix')}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
