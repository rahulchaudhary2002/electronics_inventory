import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Passkey } from '@/types/auth';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { t } = useTranslation();

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => {
            setIsDeleting(false);
            setConfirmOpen(false);
        });
    };

    return (
        <>
            <div className="flex items-center justify-between border-b border-slate-800 p-4 last:border-b-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                        <KeyRound className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-200">{passkey.name}</p>
                            {passkey.authenticator && (
                                <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    {passkey.authenticator}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                            {t('passkey.addedOn')} {passkey.created_at_diff}
                            {passkey.last_used_at_diff && (
                                <> · {t('passkey.lastUsed')} {passkey.last_used_at_diff}</>
                            )}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-rose-500/10 hover:text-rose-400"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xs rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
                        <h3 className="mb-1.5 text-sm font-bold text-slate-100">{t('passkey.removeConfirmTitle')}</h3>
                        <p className="mb-5 text-xs text-slate-400">
                            {t('passkey.removeConfirmDesc', { name: passkey.name })}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(false)}
                                className="flex-1 rounded-2xl border border-slate-700 py-2.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isDeleting ? t('passkey.removing') : t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
