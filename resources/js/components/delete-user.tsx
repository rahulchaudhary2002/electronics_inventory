import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-400">{t('settings.deleteAccount')}</h3>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3">
                <p className="mb-0.5 text-xs font-semibold text-rose-400">{t('settings.deleteWarning')}</p>
                <p className="text-[10px] text-rose-300/70">{t('settings.deleteWarningDesc')}</p>
            </div>

            <button
                type="button"
                data-test="delete-user-button"
                onClick={() => setConfirmOpen(true)}
                className="rounded-2xl bg-rose-600/20 px-4 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-600/30"
            >
                {t('settings.deleteAccountBtn')}
            </button>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xs rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
                        <h3 className="mb-1.5 text-sm font-bold text-slate-100">{t('settings.deleteConfirmTitle')}</h3>
                        <p className="mb-4 text-xs text-slate-400">
                            {t('settings.deleteConfirmDesc')}
                        </p>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{ preserveScroll: true }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-3"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder={t('auth.passwordPlaceholder')}
                                            autoComplete="current-password"
                                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        />
                                        <InputError className="mt-1" message={errors.password} />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { resetAndClearErrors(); setConfirmOpen(false); }}
                                            className="flex-1 rounded-2xl border border-slate-700 py-2.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            data-test="confirm-delete-user-button"
                                            disabled={processing}
                                            className="flex-1 rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-rose-700 disabled:opacity-60"
                                        >
                                            {processing ? t('settings.deleting') : t('common.delete')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
}
