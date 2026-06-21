import { Form } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;
    const { t } = useTranslation();

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('auth.twoFactorTitle')}</h3>
            </div>
            {twoFactorEnabled ? (
                <div className="flex flex-col items-start gap-3">
                    <p className="text-xs text-slate-400">
                        {t('twoFactor.disableDesc')}
                    </p>

                    <Form {...disable.form()}>
                        {({ processing }) => (
                            <button type="submit" disabled={processing}
                                className="rounded-2xl bg-rose-600/20 px-4 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-600/30 disabled:opacity-60">
                                {t('twoFactor.disable')}
                            </button>
                        )}
                    </Form>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start gap-3">
                    <p className="text-xs text-slate-400">
                        {t('twoFactor.enableDesc')}
                    </p>

                    {hasSetupData ? (
                        <button type="button" onClick={() => setShowSetupModal(true)}
                            className="flex items-center gap-1.5 rounded-2xl bg-indigo-600/20 px-4 py-2 text-xs font-bold text-indigo-400 transition-all hover:bg-indigo-600/30">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {t('twoFactor.continueSetup')}
                        </button>
                    ) : (
                        <Form {...enable.form()} onSuccess={() => setShowSetupModal(true)}>
                            {({ processing }) => (
                                <button type="submit" disabled={processing}
                                    className="rounded-2xl bg-indigo-600/20 px-4 py-2 text-xs font-bold text-indigo-400 transition-all hover:bg-indigo-600/30 disabled:opacity-60">
                                    {t('twoFactor.enable')}
                                </button>
                            )}
                        </Form>
                    )}
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
