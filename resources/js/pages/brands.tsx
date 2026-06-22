import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Pencil, Trash2 } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import * as brandsRoute from '@/routes/brands';

type Brand = {
    id: number;
    name: string;
    is_active: boolean;
};

type Props = {
    brands: Brand[];
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

export default function Brands({ brands, flash }: Props) {
    const { t } = useTranslation();
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const createForm = useForm({ name: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(brandsRoute.store().url, {
            onSuccess: () => createForm.reset(),
        });
    };

    const editForm = useForm({ name: '', is_active: true });

    const openEdit = (brand: Brand) => {
        setEditingBrand(brand);
        editForm.setData({ name: brand.name, is_active: brand.is_active });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;
        editForm.put(brandsRoute.update(editingBrand.id).url, {
            onSuccess: () => setEditingBrand(null),
        });
    };

    const deleteForm = useForm({});
    const handleDelete = (id: number) => {
        if (!confirm(t('brandMgmt.deleteConfirm'))) return;
        deleteForm.delete(brandsRoute.destroy(id).url);
    };

    return (
        <PosShell title={t('brandMgmt.title')} backHref="/menu" activeNav="menu">
            <Head title={t('brandMgmt.title')} />

            <div className="space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Brand list */}
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Award className="h-3.5 w-3.5" /> {t('brandMgmt.allBrands')} ({brands.length})
                        </h3>
                    </div>

                    {brands.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-600">{t('brandMgmt.noBrands')}</p>
                    ) : (
                        <div className="space-y-2">
                            {brands.map((brand) => (
                                <div key={brand.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[11px] font-black text-slate-100 truncate">{brand.name}</span>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold border ${
                                            brand.is_active
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                : 'border-slate-700 bg-slate-800 text-slate-500'
                                        }`}>
                                            {brand.is_active ? t('brandMgmt.active') : t('brandMgmt.inactive')}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 gap-1.5 ml-2">
                                        <button
                                            onClick={() => openEdit(brand)}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-indigo-500/50 hover:text-indigo-400"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(brand.id)}
                                            disabled={deleteForm.processing}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create form */}
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {t('brandMgmt.addNew')}
                    </h3>

                    <form onSubmit={handleCreate} className="space-y-3">
                        <FormField label={t('brandMgmt.brandName') + ' *'} error={createForm.errors.name}>
                            <input
                                className={inputCls}
                                placeholder={t('brandMgmt.namePlaceholder')}
                                value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                required
                            />
                        </FormField>

                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
                        >
                            {createForm.processing ? t('brandMgmt.creating') : '✓ ' + t('brandMgmt.createBtn')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Edit modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="flex items-center gap-1.5 text-sm font-black text-indigo-400">
                                <Pencil className="h-4 w-4" /> {t('brandMgmt.editTitle')}
                            </h3>
                            <button onClick={() => setEditingBrand(null)} className="text-lg text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-3">
                            <FormField label={t('brandMgmt.name') + ' *'} error={editForm.errors.name}>
                                <input
                                    className={inputCls}
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                    required
                                />
                            </FormField>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('brandMgmt.status')}</label>
                                <div className="flex gap-2">
                                    {[true, false].map((val) => (
                                        <button
                                            key={String(val)}
                                            type="button"
                                            onClick={() => editForm.setData('is_active', val)}
                                            className={`flex-1 rounded-2xl border py-2 text-[11px] font-bold transition-all ${
                                                editForm.data.is_active === val
                                                    ? val
                                                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-slate-600 bg-slate-800 text-slate-300'
                                                    : 'border-slate-800 bg-slate-950 text-slate-600 hover:border-slate-700'
                                            }`}
                                        >
                                            {val ? t('brandMgmt.active') : t('brandMgmt.inactive')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {editForm.processing ? t('brandMgmt.saving') : '✓ ' + t('brandMgmt.saveChanges')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
