import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import SettingsShell from '@/components/settings-shell';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = { auth: Auth };

const inputCls = 'w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<PageProps>().props;
    const { t } = useTranslation();

    return (
        <SettingsShell>
            <Head title={t('settings.profile')} />

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                <h3 className="mb-4 border-b border-slate-800 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('settings.profileInfo')}
                </h3>

                <Form {...ProfileController.update.form()} options={{ preserveScroll: true }} className="space-y-3">
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <label className={labelCls}>{t('settings.name')}</label>
                                <input name="name" defaultValue={auth.user.name} required autoComplete="name"
                                    placeholder={t('settings.namePlaceholder')} className={inputCls} />
                                <InputError className="mt-1" message={errors.name} />
                            </div>

                            <div>
                                <label className={labelCls}>{t('settings.emailAddress')}</label>
                                <input name="email" type="email" defaultValue={auth.user.email} required
                                    autoComplete="username" placeholder={t('settings.emailPlaceholder')} className={inputCls} />
                                <InputError className="mt-1" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-300">
                                    {t('settings.unverifiedEmail')}{' '}
                                    <Link href={send()} as="button"
                                        className="underline underline-offset-2 hover:text-white">
                                        {t('settings.resendVerification')}
                                    </Link>
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-1 font-medium text-emerald-400">{t('settings.verificationLinkSent')}</p>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={processing}
                                className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60">
                                {processing ? t('settings.saving') : t('settings.saveChanges')}
                            </button>
                        </>
                    )}
                </Form>
            </div>

            <div className="rounded-3xl border border-rose-500/20 bg-slate-900 p-4 shadow-xl">
                <DeleteUser />
            </div>
        </SettingsShell>
    );
}
