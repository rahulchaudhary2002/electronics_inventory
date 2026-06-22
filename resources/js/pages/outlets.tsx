import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Pencil, Store, Trash2, User } from 'lucide-react';
import PosShell from '@/components/pos-shell';

type OutletUser = {
    id: number;
    name: string;
    email: string;
    outlet_id: number;
};

type Outlet = {
    id: number;
    name: string;
    code: string;
    address: string;
    users: OutletUser[];
};

type Props = {
    outlets: Outlet[];
    flash?: { success?: string };
};

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
            {children}
            {error && <p className="mt-1 text-[10px] text-rose-400">{error}</p>}
        </div>
    );
}

const inputCls = 'w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function Outlets({ outlets, flash }: Props) {
    const { t } = useTranslation();
    const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);

    // ── Create form ──
    const createForm = useForm({
        name: '',
        code: '',
        address: '',
        user_name: '',
        user_email: '',
        user_password: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/outlets', {
            onSuccess: () => createForm.reset(),
        });
    };

    // ── Edit form ──
    const editForm = useForm({
        name: '',
        code: '',
        address: '',
    });

    const openEdit = (outlet: Outlet) => {
        setEditingOutlet(outlet);
        editForm.setData({
            name: outlet.name,
            code: outlet.code,
            address: outlet.address,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOutlet) return;
        editForm.put(`/outlets/${editingOutlet.id}`, {
            onSuccess: () => setEditingOutlet(null),
        });
    };

    // ── Delete ──
    const deleteForm = useForm({});
    const handleDelete = (id: number) => {
        if (!confirm(t('outlets.deleteConfirm'))) return;
        deleteForm.delete(`/outlets/${id}`);
    };

    return (
        <PosShell title={t('outlets.title')} backHref="/menu" activeNav="menu">
            <Head title={t('outlets.title')} />

            <div className="space-y-4 p-4">
                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Outlet list */}
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Store className="h-3.5 w-3.5" /> {t('outlets.activeOutlets')} ({outlets.length})
                        </h3>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-400">LIVE</span>
                    </div>

                    {outlets.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-600">{t('outlets.noOutlets')}</p>
                    ) : (
                        <div className="space-y-2">
                            {outlets.map((outlet) => (
                                <div key={outlet.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black text-slate-100">{outlet.name}</span>
                                                <span className="shrink-0 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[8px] font-bold text-indigo-400">
                                                    {outlet.code}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="h-3 w-3 shrink-0" />{outlet.address}</p>
                                            {outlet.users.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {outlet.users.map((u) => (
                                                        <span key={u.id} className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[8px] text-slate-400">
                                                            <User className="h-2.5 w-2.5" />{u.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <button
                                                onClick={() => openEdit(outlet)}
                                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-indigo-500/50 hover:text-indigo-400"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(outlet.id)}
                                                disabled={deleteForm.processing}
                                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create form */}
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {t('outlets.addNew')}
                    </h3>

                    <form onSubmit={handleCreate} className="space-y-3">
                        {/* Outlet details */}
                        <div className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{t('outlets.outletDetails')}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('outlets.outletName') + ' *'} error={createForm.errors.name}>
                                    <input
                                        className={inputCls}
                                        placeholder={t('outlets.outletNamePlaceholder')}
                                        value={createForm.data.name}
                                        onChange={e => createForm.setData('name', e.target.value)}
                                        required
                                    />
                                </FormField>
                                <FormField label={t('outlets.code') + ' *'} error={createForm.errors.code}>
                                    <input
                                        className={inputCls}
                                        placeholder={t('outlets.codePlaceholder')}
                                        value={createForm.data.code}
                                        onChange={e => createForm.setData('code', e.target.value)}
                                        required
                                    />
                                </FormField>
                            </div>

                            <FormField label={t('outlets.address') + ' *'} error={createForm.errors.address}>
                                <input
                                    className={inputCls}
                                    placeholder={t('outlets.addressPlaceholder')}
                                    value={createForm.data.address}
                                    onChange={e => createForm.setData('address', e.target.value)}
                                    required
                                />
                            </FormField>
                        </div>

                        {/* Staff account */}
                        <div className="space-y-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-3">
                            <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                                <User className="h-3 w-3" /> {t('outlets.staffAccount')}
                            </p>

                            <FormField label={t('outlets.staffName') + ' *'} error={createForm.errors.user_name}>
                                <input
                                    className={inputCls}
                                    placeholder={t('outlets.staffNamePlaceholder')}
                                    value={createForm.data.user_name}
                                    onChange={e => createForm.setData('user_name', e.target.value)}
                                    required
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('outlets.loginEmail') + ' *'} error={createForm.errors.user_email}>
                                    <input
                                        type="email"
                                        className={inputCls}
                                        placeholder={t('outlets.staffEmailPlaceholder')}
                                        value={createForm.data.user_email}
                                        onChange={e => createForm.setData('user_email', e.target.value)}
                                        required
                                    />
                                </FormField>
                                <FormField label={t('outlets.passwordLabel') + ' *'} error={createForm.errors.user_password}>
                                    <input
                                        type="password"
                                        className={inputCls}
                                        placeholder={t('outlets.passwordMinLength')}
                                        value={createForm.data.user_password}
                                        onChange={e => createForm.setData('user_password', e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </FormField>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
                        >
                            {createForm.processing ? t('outlets.creating') : '✓ ' + t('outlets.createBtn')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Edit modal */}
            {editingOutlet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm space-y-4 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="flex items-center gap-1.5 text-sm font-black text-indigo-400"><Pencil className="h-4 w-4" /> {t('outlets.editTitle')}</h3>
                            <button onClick={() => setEditingOutlet(null)} className="text-lg text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('outlets.name') + ' *'} error={editForm.errors.name}>
                                    <input className={inputCls} value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                                </FormField>
                                <FormField label={t('outlets.code') + ' *'} error={editForm.errors.code}>
                                    <input className={inputCls} value={editForm.data.code} onChange={e => editForm.setData('code', e.target.value)} required />
                                </FormField>
                            </div>
                            <FormField label={t('outlets.address') + ' *'} error={editForm.errors.address}>
                                <input className={inputCls} value={editForm.data.address} onChange={e => editForm.setData('address', e.target.value)} required />
                            </FormField>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {editForm.processing ? t('outlets.saving') : '✓ ' + t('outlets.saveChanges')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
