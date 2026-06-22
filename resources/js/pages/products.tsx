import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Pencil, Trash2, Store } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import * as productsRoute from '@/routes/products';

type Brand    = { id: number; name: string };
type Category = { id: number; name: string };
type Outlet   = { id: number; name: string; code: string };

type OutletPivot = Outlet & {
    pivot: { initial_qty: number; cost: string };
};

type Product = {
    id: number;
    name: string;
    model_number: string | null;
    type: string | null;
    warranty: string | null;
    is_active: boolean;
    brand: Brand;
    category: Category;
    outlets: OutletPivot[];
};

type OutletEntry = { id: number; initial_qty: number; cost: string };

type FormData = {
    name: string;
    model_number: string;
    type: string;
    warranty: string;
    brand_id: number | '';
    category_id: number | '';
    is_active: boolean;
    outlets: OutletEntry[];
};

type Props = {
    products: Product[];
    brands: Brand[];
    categories: Category[];
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

const inputCls   = 'w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 placeholder-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500';
const selectCls  = 'w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500';

function OutletStockEditor({
    outlets,
    entries,
    onChange,
}: {
    outlets: Outlet[];
    entries: OutletEntry[];
    onChange: (entries: OutletEntry[]) => void;
}) {
    const { t } = useTranslation();

    const toggle = (outlet: Outlet) => {
        const exists = entries.find(e => e.id === outlet.id);
        if (exists) {
            onChange(entries.filter(e => e.id !== outlet.id));
        } else {
            onChange([...entries, { id: outlet.id, initial_qty: 0, cost: '0' }]);
        }
    };

    const update = (id: number, field: 'initial_qty' | 'cost', value: string) => {
        onChange(entries.map(e =>
            e.id === id ? { ...e, [field]: field === 'initial_qty' ? parseInt(value) || 0 : value } : e
        ));
    };

    return (
        <div className="space-y-2">
            {outlets.map(outlet => {
                const entry = entries.find(e => e.id === outlet.id);
                const checked = !!entry;
                return (
                    <div key={outlet.id} className={`rounded-2xl border transition-all ${checked ? 'border-indigo-500/30 bg-indigo-950/20' : 'border-slate-800 bg-slate-950'}`}>
                        <label className="flex cursor-pointer items-center gap-2 px-3 py-2.5">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(outlet)}
                                className="accent-indigo-500"
                            />
                            <span className="text-[11px] font-bold text-slate-200">{outlet.name}</span>
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">{outlet.code}</span>
                        </label>
                        {checked && (
                            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                                <FormField label={t('productMgmt.initialQty')}>
                                    <input
                                        type="number"
                                        min={0}
                                        className={inputCls}
                                        value={entry!.initial_qty}
                                        onChange={e => update(outlet.id, 'initial_qty', e.target.value)}
                                    />
                                </FormField>
                                <FormField label={t('productMgmt.cost')}>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className={inputCls}
                                        value={entry!.cost}
                                        onChange={e => update(outlet.id, 'cost', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Products({ products, brands, categories, outlets, flash }: Props) {
    const { t } = useTranslation();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const blankForm = (): FormData => ({
        name: '', model_number: '', type: '', warranty: '',
        brand_id: '', category_id: '', is_active: true, outlets: [],
    });

    const createForm = useForm<FormData>(blankForm());

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(productsRoute.store().url, {
            onSuccess: () => createForm.setData(blankForm()),
        });
    };

    const editForm = useForm<FormData>(blankForm());

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        editForm.setData({
            name:         product.name,
            model_number: product.model_number ?? '',
            type:         product.type ?? '',
            warranty:     product.warranty ?? '',
            brand_id:     product.brand.id,
            category_id:  product.category.id,
            is_active:    product.is_active,
            outlets:      product.outlets.map(o => ({
                id:          o.id,
                initial_qty: o.pivot.initial_qty,
                cost:        o.pivot.cost,
            })),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        editForm.put(productsRoute.update(editingProduct.id).url, {
            onSuccess: () => setEditingProduct(null),
        });
    };

    const deleteForm = useForm({});
    const handleDelete = (id: number) => {
        if (!confirm(t('productMgmt.deleteConfirm'))) return;
        deleteForm.delete(productsRoute.destroy(id).url);
    };

    return (
        <PosShell title={t('productMgmt.title')} backHref="/menu">
            <Head title={t('productMgmt.title')} />

            <div className="space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Product list */}
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                    <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Package className="h-3.5 w-3.5" /> {t('productMgmt.allProducts')} ({products.length})
                    </h3>

                    {products.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-600">{t('productMgmt.noProducts')}</p>
                    ) : (
                        <div className="space-y-2">
                            {products.map(product => (
                                <div key={product.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-[11px] font-black text-slate-100">{product.name}</span>
                                                {product.model_number && (
                                                    <span className="rounded-full border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-400">{product.model_number}</span>
                                                )}
                                                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold border ${
                                                    product.is_active
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-slate-700 bg-slate-800 text-slate-500'
                                                }`}>
                                                    {product.is_active ? t('productMgmt.active') : t('productMgmt.inactive')}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-[8px] text-violet-400">{product.category.name}</span>
                                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[8px] text-amber-400">{product.brand.name}</span>
                                                {product.type && (
                                                    <span className="rounded-full border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[8px] text-slate-400">{product.type}</span>
                                                )}
                                                {product.warranty && (
                                                    <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[8px] text-sky-400">{product.warranty}</span>
                                                )}
                                            </div>
                                            {product.outlets.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {product.outlets.map(o => (
                                                        <span key={o.id} className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[8px] text-slate-400">
                                                            <Store className="h-2.5 w-2.5" /> {o.code} · {o.pivot.initial_qty} · NPR {Number(o.pivot.cost).toLocaleString()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:border-indigo-500/50 hover:text-indigo-400"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
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
                <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {t('productMgmt.addNew')}
                    </h3>

                    <form onSubmit={handleCreate} className="space-y-3">
                        {/* Basic info */}
                        <div className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Product Details</p>

                            <FormField label={t('productMgmt.productName') + ' *'} error={createForm.errors.name}>
                                <input className={inputCls} placeholder={t('productMgmt.namePlaceholder')} value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} required />
                            </FormField>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('productMgmt.modelNumber')} error={createForm.errors.model_number}>
                                    <input className={inputCls} placeholder={t('productMgmt.modelPlaceholder')} value={createForm.data.model_number} onChange={e => createForm.setData('model_number', e.target.value)} />
                                </FormField>
                                <FormField label={t('productMgmt.type')} error={createForm.errors.type}>
                                    <input className={inputCls} placeholder={t('productMgmt.typePlaceholder')} value={createForm.data.type} onChange={e => createForm.setData('type', e.target.value)} />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('productMgmt.brand') + ' *'} error={createForm.errors.brand_id}>
                                    <select className={selectCls} value={createForm.data.brand_id} onChange={e => createForm.setData('brand_id', Number(e.target.value))} required>
                                        <option value="">{t('productMgmt.selectBrand')}</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label={t('productMgmt.category') + ' *'} error={createForm.errors.category_id}>
                                    <select className={selectCls} value={createForm.data.category_id} onChange={e => createForm.setData('category_id', Number(e.target.value))} required>
                                        <option value="">{t('productMgmt.selectCategory')}</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label={t('productMgmt.warranty')} error={createForm.errors.warranty}>
                                <input className={inputCls} placeholder={t('productMgmt.warrantyPlaceholder')} value={createForm.data.warranty} onChange={e => createForm.setData('warranty', e.target.value)} />
                            </FormField>
                        </div>

                        {/* Outlet stock */}
                        <div className="space-y-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">{t('productMgmt.outletStock')}</p>
                            <p className="text-[10px] text-slate-500">{t('productMgmt.outletStockDesc')}</p>
                            {outlets.length === 0
                                ? <p className="text-xs text-slate-600">{t('productMgmt.noOutlets')}</p>
                                : <OutletStockEditor outlets={outlets} entries={createForm.data.outlets} onChange={v => createForm.setData('outlets', v)} />
                            }
                        </div>

                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
                        >
                            {createForm.processing ? t('productMgmt.creating') : '✓ ' + t('productMgmt.createBtn')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Edit modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="my-4 w-full max-w-sm space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="flex items-center gap-1.5 text-sm font-black text-indigo-400">
                                <Pencil className="h-4 w-4" /> {t('productMgmt.editTitle')}
                            </h3>
                            <button onClick={() => setEditingProduct(null)} className="text-lg text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-3">
                            <FormField label={t('productMgmt.name') + ' *'} error={editForm.errors.name}>
                                <input className={inputCls} value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                            </FormField>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('productMgmt.modelNumber')} error={editForm.errors.model_number}>
                                    <input className={inputCls} value={editForm.data.model_number} onChange={e => editForm.setData('model_number', e.target.value)} />
                                </FormField>
                                <FormField label={t('productMgmt.type')} error={editForm.errors.type}>
                                    <input className={inputCls} value={editForm.data.type} onChange={e => editForm.setData('type', e.target.value)} />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={t('productMgmt.brand') + ' *'} error={editForm.errors.brand_id}>
                                    <select className={selectCls} value={editForm.data.brand_id} onChange={e => editForm.setData('brand_id', Number(e.target.value))} required>
                                        <option value="">{t('productMgmt.selectBrand')}</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label={t('productMgmt.category') + ' *'} error={editForm.errors.category_id}>
                                    <select className={selectCls} value={editForm.data.category_id} onChange={e => editForm.setData('category_id', Number(e.target.value))} required>
                                        <option value="">{t('productMgmt.selectCategory')}</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label={t('productMgmt.warranty')} error={editForm.errors.warranty}>
                                <input className={inputCls} value={editForm.data.warranty} onChange={e => editForm.setData('warranty', e.target.value)} />
                            </FormField>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('productMgmt.status')}</label>
                                <div className="flex gap-2">
                                    {([true, false] as const).map(val => (
                                        <button key={String(val)} type="button" onClick={() => editForm.setData('is_active', val)}
                                            className={`flex-1 rounded-2xl border py-2 text-[11px] font-bold transition-all ${
                                                editForm.data.is_active === val
                                                    ? val ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-600 bg-slate-800 text-slate-300'
                                                    : 'border-slate-800 bg-slate-950 text-slate-600 hover:border-slate-700'
                                            }`}>
                                            {val ? t('productMgmt.active') : t('productMgmt.inactive')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-3">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">{t('productMgmt.outletStock')}</p>
                                <OutletStockEditor outlets={outlets} entries={editForm.data.outlets} onChange={v => editForm.setData('outlets', v)} />
                            </div>

                            <button type="submit" disabled={editForm.processing}
                                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60">
                                {editForm.processing ? t('productMgmt.saving') : '✓ ' + t('productMgmt.saveChanges')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
