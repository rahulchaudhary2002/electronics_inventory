import { usePasskeyRegister } from '@laravel/passkeys/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const { t } = useTranslation();
    const [name, setName] = useState(() => {
        const ua = navigator.userAgent;
        const browser = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'].find(
            (browser) => new RegExp(browser).test(ua),
        );
        const os = ['iPhone', 'iPad', 'Android', 'Mac', 'Windows'].find((os) =>
            new RegExp(os).test(ua),
        );
        return [browser, os].filter(Boolean).join(' on ') || '';
    });

    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            setShowForm(false);
            onSuccess();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <p className="text-xs text-slate-500">{t('passkey.notSupported')}</p>
        );
    }

    if (!showForm) {
        return (
            <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700"
            >
                {t('passkey.addPasskey')}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('passkey.passkeyName')}
                </label>
                <input
                    id="passkey-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('passkey.passkeyNamePlaceholder')}
                    autoFocus
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-[10px] text-slate-500">{t('passkey.passkeyNameDesc')}</p>
            </div>

            {error && <InputError message={error} />}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="flex-1 rounded-2xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                >
                    {isLoading ? t('passkey.registering') : t('passkey.register')}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-2xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-400 transition-all hover:bg-slate-800"
                >
                    {t('common.cancel')}
                </button>
            </div>
        </form>
    );
}
