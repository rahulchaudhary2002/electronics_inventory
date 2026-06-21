import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import SettingsShell from '@/components/settings-shell';

type Props = { passwordRules: string } & ManagePasskeysProps & ManageTwoFactorProps;

const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400';

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    return (
        <SettingsShell>
            <Head title={t('settings.security')} />

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                <h3 className="mb-4 border-b border-slate-800 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('settings.updatePassword')}
                </h3>

                <Form
                    {...SecurityController.update.form()}
                    options={{ preserveScroll: true }}
                    resetOnError={['password', 'password_confirmation', 'current_password']}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) passwordInput.current?.focus();
                        if (errors.current_password) currentPasswordInput.current?.focus();
                    }}
                    className="space-y-3"
                >
                    {({ errors, processing }) => (
                        <>
                            <div>
                                <label className={labelCls}>{t('settings.currentPassword')}</label>
                                <PasswordInput id="current_password" ref={currentPasswordInput}
                                    name="current_password" autoComplete="current-password"
                                    placeholder={t('settings.currentPasswordPlaceholder')}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <InputError className="mt-1" message={errors.current_password} />
                            </div>

                            <div>
                                <label className={labelCls}>{t('settings.newPassword')}</label>
                                <PasswordInput id="password" ref={passwordInput}
                                    name="password" autoComplete="new-password"
                                    placeholder={t('settings.newPasswordPlaceholder')} passwordrules={props.passwordRules}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <InputError className="mt-1" message={errors.password} />
                            </div>

                            <div>
                                <label className={labelCls}>{t('settings.confirmPassword')}</label>
                                <PasswordInput id="password_confirmation"
                                    name="password_confirmation" autoComplete="new-password"
                                    placeholder={t('settings.confirmPasswordPlaceholder')} passwordrules={props.passwordRules}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <InputError className="mt-1" message={errors.password_confirmation} />
                            </div>

                            <button type="submit" disabled={processing}
                                className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60">
                                {processing ? t('settings.saving') : t('settings.updatePasswordBtn')}
                            </button>
                        </>
                    )}
                </Form>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                <ManageTwoFactor
                    canManageTwoFactor={props.canManageTwoFactor}
                    requiresConfirmation={props.requiresConfirmation}
                    twoFactorEnabled={props.twoFactorEnabled}
                />
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                <ManagePasskeys
                    canManagePasskeys={props.canManagePasskeys}
                    passkeys={props.passkeys}
                />
            </div>
        </SettingsShell>
    );
}
