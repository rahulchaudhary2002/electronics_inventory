import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Check, Copy, ScanLine, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const [copiedText, copy] = useClipboard();
    const IconComponent = copiedText === manualSetupKey ? Check : Copy;
    const { t } = useTranslation();

    return (
        <>
            {errors?.length ? (
                <AlertError errors={errors} />
            ) : (
                <>
                    <div className="mx-auto flex overflow-hidden">
                        <div className="mx-auto aspect-square w-56 rounded-2xl border border-slate-700">
                            <div className="flex h-full w-full items-center justify-center p-4">
                                {qrCodeSvg ? (
                                    <div
                                        className="aspect-square w-full rounded-xl bg-white p-2 [&_svg]:size-full"
                                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                    />
                                ) : (
                                    <Spinner />
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onNextStep}
                        className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700"
                    >
                        {buttonText}
                    </button>

                    <div className="relative flex w-full items-center justify-center">
                        <div className="absolute inset-0 top-1/2 h-px w-full bg-slate-800" />
                        <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500">
                            {t('twoFactor.orEnterManually')}
                        </span>
                    </div>

                    <div className="flex w-full overflow-hidden rounded-2xl border border-slate-800">
                        {!manualSetupKey ? (
                            <div className="flex w-full items-center justify-center bg-slate-950 p-3">
                                <Spinner />
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    readOnly
                                    value={manualSetupKey}
                                    className="h-full w-full bg-slate-950 p-3 font-mono text-xs text-slate-300 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copy(manualSetupKey)}
                                    className="border-l border-slate-800 px-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200"
                                >
                                    <IconComponent className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        setTimeout(() => {
            pinInputContainerRef.current?.querySelector('input')?.focus();
        }, 0);
    }, []);

    return (
        <Form {...confirm.form()} onSuccess={() => onClose()} resetOnError resetOnSuccess>
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <div ref={pinInputContainerRef} className="w-full space-y-4">
                    <div className="flex w-full flex-col items-center space-y-2 py-2">
                        <InputOTP
                            id="otp"
                            name="code"
                            maxLength={OTP_MAX_LENGTH}
                            onChange={setCode}
                            disabled={processing}
                            pattern={REGEXP_ONLY_DIGITS}
                            autoFocus
                        >
                            <InputOTPGroup>
                                {Array.from({ length: OTP_MAX_LENGTH }, (_, index) => (
                                    <InputOTPSlot key={index} index={index} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                        <InputError message={errors?.confirmTwoFactorAuthentication?.code} />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={processing}
                            className="flex-1 rounded-2xl border border-slate-700 py-3 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-60"
                        >
                            {t('twoFactor.back')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing || code.length < OTP_MAX_LENGTH}
                            className="flex-1 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {t('twoFactor.confirm')}
                        </button>
                    </div>
                </div>
            )}
        </Form>
    );
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] = useState<boolean>(false);
    const { t } = useTranslation();

    const modalConfig = useMemo<{ title: string; description: string; buttonText: string }>(() => {
        if (twoFactorEnabled) {
            return {
                title: t('twoFactor.setupEnabled'),
                description: t('twoFactor.setupEnabledDesc'),
                buttonText: t('twoFactor.close'),
            };
        }
        if (showVerificationStep) {
            return {
                title: t('twoFactor.verifyTitle'),
                description: t('twoFactor.verifyDesc'),
                buttonText: t('twoFactor.confirm'),
            };
        }
        return {
            title: t('twoFactor.setupTitle'),
            description: t('twoFactor.setupDesc'),
            buttonText: t('twoFactor.confirm'),
        };
    }, [twoFactorEnabled, showVerificationStep, t]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);
        clearSetupData();
    }, [clearSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }
        handleClose();
    }, [requiresConfirmation, handleClose]);

    const fetchSetupDataRef = useRef(fetchSetupData);
    useEffect(() => { fetchSetupDataRef.current = fetchSetupData; }, [fetchSetupData]);
    useEffect(() => {
        if (isOpen && !qrCodeSvg) fetchSetupDataRef.current();
    }, [isOpen, qrCodeSvg]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/10">
                            <ScanLine className="h-3.5 w-3.5 text-indigo-400" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-100">{modalConfig.title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-300"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="p-5">
                    <p className="mb-4 text-xs text-slate-400">{modalConfig.description}</p>
                    <div className="flex flex-col items-center space-y-4">
                        {showVerificationStep ? (
                            <TwoFactorVerificationStep
                                onClose={handleClose}
                                onBack={() => setShowVerificationStep(false)}
                            />
                        ) : (
                            <TwoFactorSetupStep
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                buttonText={modalConfig.buttonText}
                                onNextStep={handleModalNextStep}
                                errors={errors}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
