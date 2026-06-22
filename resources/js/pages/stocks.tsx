import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, X } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import { useAuth } from '@/hooks/use-auth';
import * as stocksRoute from '@/routes/stocks';
import * as productsRoute from '@/routes/products';

// ─── Types ───────────────────────────────────────────────────────────────────

type Brand    = { id: number; name: string };
type Category = { id: number; name: string };
type Outlet   = { id: number; name: string; code: string };

type StockProduct = {
    id: number;
    name: string;
    model_number: string | null;
    type: string | null;
    warranty: string | null;
    brand: Brand;
    category: Category;
};

type StockEntry = {
    id: number;
    quantity: string;
    outlet: Outlet;
    product: StockProduct;
};

type SimpleProduct = { id: number; name: string; model_number: string | null };
type StockedPair   = { outlet_id: number; product_id: number };
type StockAction   = 'directAdd' | 'transferStock';

type Props = {
    stocks: StockEntry[];
    allStocks: StockedPair[];
    products: SimpleProduct[];
    brands: Brand[];
    categories: Category[];
    outlets: Outlet[];
    flash?: { success?: string };
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function FormInput({ label, className = '', ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <input className={`w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`} {...props} />
        </div>
    );
}

function FormSelect({ label, children, className = '', ...props }: { label: string; children: React.ReactNode; className?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <select className={`w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`} {...props}>
                {children}
            </select>
        </div>
    );
}

function SectionHeading({ icon, label, badge }: { icon: string; label: string; badge?: string }) {
    return (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{icon} {label}</h3>
            {badge && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-emerald-400">{badge}</span>}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Stocks({ stocks, allStocks, products, brands, categories, outlets, flash }: Props) {
    const { t } = useTranslation();
    const { isSuperadmin, outletId: userOutletId } = useAuth();

    const [search, setSearch]                     = useState('');
    const [outletFilter, setOutletFilter]         = useState('All');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingStock, setEditingStock]         = useState<StockEntry | null>(null);
    const [editQty, setEditQty]                   = useState('');
    const [stockAction, setStockAction]           = useState<StockAction>('directAdd');

    // ── Direct-add form state ──────────────────────────────────────────────
    const [formOutletId, setFormOutletId] = useState<number | ''>(isSuperadmin ? '' : (userOutletId ?? ''));

    const availableProducts = useMemo(() => {
        if (!formOutletId) return products;
        return products.filter(p => !allStocks.some(s => s.outlet_id === formOutletId && s.product_id === p.id));
    }, [products, allStocks, formOutletId]);

    // ── Transfer form state ────────────────────────────────────────────────
    const [transferFromId, setTransferFromId] = useState<number | ''>(isSuperadmin ? '' : (userOutletId ?? ''));

    const transferProducts = useMemo(() => {
        if (!transferFromId) return [];
        return products.filter(p => allStocks.some(s => s.outlet_id === transferFromId && s.product_id === p.id));
    }, [products, allStocks, transferFromId]);

    const toOutlets = useMemo(() => outlets.filter(o => o.id !== transferFromId), [outlets, transferFromId]);

    // ── Outlet pills (ledger) ──────────────────────────────────────────────
    const outletCodes = useMemo(() => ['All', ...outlets.map(o => o.code)], [outlets]);

    const filtered = useMemo(() =>
        stocks.filter(s => {
            const matchOutlet = outletFilter === 'All' || s.outlet.code === outletFilter;
            const q = search.toLowerCase();
            const matchSearch = !q ||
                s.product.name.toLowerCase().includes(q) ||
                s.product.brand.name.toLowerCase().includes(q) ||
                s.product.category.name.toLowerCase().includes(q) ||
                (s.product.model_number ?? '').toLowerCase().includes(q);
            return matchOutlet && matchSearch;
        }),
    [stocks, search, outletFilter]);

    // ── Add form ──────────────────────────────────────────────────────────
    const addForm = useForm<{
        product_id: number | '';
        outlet_id:  number | '';
        quantity:   string;
        cost:       string;
    }>({
        product_id: '',
        outlet_id:  isSuperadmin ? '' : (userOutletId ?? ''),
        quantity:   '',
        cost:       '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(stocksRoute.store().url, {
            onSuccess: () => addForm.reset(),
        });
    };

    // ── Transfer form ─────────────────────────────────────────────────────
    const transferForm = useForm<{
        product_id:     number | '';
        from_outlet_id: number | '';
        to_outlet_id:   number | '';
        quantity:       string;
    }>({
        product_id:     '',
        from_outlet_id: isSuperadmin ? '' : (userOutletId ?? ''),
        to_outlet_id:   '',
        quantity:       '',
    });

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        transferForm.post(stocksRoute.transfer().url, {
            onSuccess: () => {
                transferForm.reset();
                setTransferFromId(isSuperadmin ? '' : (userOutletId ?? ''));
            },
        });
    };

    // ── Edit qty ──────────────────────────────────────────────────────────
    const openEdit = (stock: StockEntry) => {
        setEditingStock(stock);
        setEditQty(stock.quantity);
    };

    const handleSaveQty = () => {
        if (!editingStock) return;
        router.put(stocksRoute.update(editingStock.id).url, { quantity: editQty }, {
            preserveScroll: true,
            onSuccess: () => setEditingStock(null),
        });
    };

    // ── Quick product creation ─────────────────────────────────────────────
    const productForm = useForm({
        name: '', model_number: '', type: '', warranty: '',
        brand_id:    '' as number | '',
        category_id: '' as number | '',
        outlets:     [] as { id: number; initial_qty: number; cost: string }[],
    });

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault();
        productForm.post(productsRoute.store().url, {
            onSuccess: () => { setShowProductModal(false); productForm.reset(); },
        });
    };

    return (
        <PosShell activeNav="store">
            <Head title={t('stockMgmt.title')} />

            <div className="space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Stock entry card with tabs */}
                <div className="space-y-4 rounded-3xl border border-slate-850 bg-slate-900 p-4 shadow-xl">

                    {/* Tab toggle */}
                    <div className="grid grid-cols-2 gap-0 rounded-2xl border border-slate-800 bg-slate-950 p-1">
                        <button
                            type="button"
                            onClick={() => setStockAction('directAdd')}
                            className={`rounded-xl py-2.5 text-[11px] font-bold transition-all ${stockAction === 'directAdd' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            + {t('stock.newStock')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStockAction('transferStock')}
                            className={`rounded-xl py-2.5 text-[11px] font-bold transition-all ${stockAction === 'transferStock' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            ⇄ {t('stock.transferStock')}
                        </button>
                    </div>

                    {/* ── Direct add form ── */}
                    {stockAction === 'directAdd' && (
                        <>
                            <SectionHeading icon="↓" label={t('stockMgmt.addStock')} />
                            <form onSubmit={handleAdd} className="space-y-3">
                                {isSuperadmin && (
                                    <FormSelect
                                        label={t('stockMgmt.outlet') + ' *'}
                                        value={addForm.data.outlet_id}
                                        onChange={e => {
                                            const id = Number(e.target.value);
                                            addForm.setData('outlet_id', id);
                                            setFormOutletId(id);
                                            addForm.setData('product_id', '');
                                        }}
                                        required
                                    >
                                        <option value="">{t('stockMgmt.filterByOutlet')}...</option>
                                        {outlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                    </FormSelect>
                                )}

                                <FormSelect
                                    label={t('stockMgmt.product') + ' *'}
                                    value={addForm.data.product_id}
                                    onChange={e => addForm.setData('product_id', Number(e.target.value))}
                                    required
                                >
                                    <option value="">{t('stockMgmt.selectProduct')}</option>
                                    {availableProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}{p.model_number ? ` (${p.model_number})` : ''}</option>
                                    ))}
                                </FormSelect>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-600">{t('stockMgmt.orAddProduct')}</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowProductModal(true)}
                                        className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20"
                                    >
                                        {t('stockMgmt.addNewProduct')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <FormInput
                                        label={t('stockMgmt.quantity') + ' *'}
                                        type="number" min={0} step="0.01" placeholder="0"
                                        value={addForm.data.quantity}
                                        onChange={e => addForm.setData('quantity', e.target.value)}
                                        required
                                    />
                                    <FormInput
                                        label={t('stockMgmt.cost') + ' *'}
                                        type="number" min={0} step="0.01" placeholder="0.00"
                                        value={addForm.data.cost}
                                        onChange={e => addForm.setData('cost', e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {addForm.processing ? t('stockMgmt.adding') : '✓ ' + t('stockMgmt.addBtn')}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── Transfer form ── */}
                    {stockAction === 'transferStock' && (
                        <>
                            <SectionHeading icon="⇄" label={t('stock.transferTitle')} />
                            <form onSubmit={handleTransfer} className="space-y-3">

                                {/* From outlet — superadmin picks, outlet user sees their own (locked) */}
                                {isSuperadmin ? (
                                    <FormSelect
                                        label={t('stockMgmt.fromOutlet') + ' *'}
                                        value={transferForm.data.from_outlet_id}
                                        onChange={e => {
                                            const id = Number(e.target.value);
                                            transferForm.setData('from_outlet_id', id);
                                            transferForm.setData('product_id', '');
                                            transferForm.setData('to_outlet_id', '');
                                            setTransferFromId(id);
                                        }}
                                        required
                                    >
                                        <option value="">{t('stockMgmt.filterByOutlet')}...</option>
                                        {outlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                    </FormSelect>
                                ) : (
                                    <div>
                                        <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">{t('stockMgmt.fromOutlet')}</label>
                                        <div className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
                                            {outlets.find(o => o.id === userOutletId)?.name ?? '—'}
                                        </div>
                                    </div>
                                )}

                                {/* Product — only those stocked at from-outlet */}
                                <FormSelect
                                    label={t('stock.transferItem') + ' *'}
                                    value={transferForm.data.product_id}
                                    onChange={e => transferForm.setData('product_id', Number(e.target.value))}
                                    disabled={!transferFromId}
                                    required
                                >
                                    <option value="">
                                        {!transferFromId
                                            ? t('stockMgmt.filterByOutlet') + '...'
                                            : transferProducts.length === 0
                                                ? t('stockMgmt.noProductsToTransfer')
                                                : t('stockMgmt.selectProduct')}
                                    </option>
                                    {transferProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}{p.model_number ? ` (${p.model_number})` : ''}</option>
                                    ))}
                                </FormSelect>

                                {/* To outlet */}
                                <FormSelect
                                    label={t('stockMgmt.toOutlet') + ' *'}
                                    value={transferForm.data.to_outlet_id}
                                    onChange={e => transferForm.setData('to_outlet_id', Number(e.target.value))}
                                    disabled={!transferFromId}
                                    required
                                >
                                    <option value="">{t('stockMgmt.filterByOutlet')}...</option>
                                    {toOutlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                </FormSelect>

                                {/* Quantity */}
                                <FormInput
                                    label={t('stock.transferQty') + ' *'}
                                    type="number" min={0.01} step="0.01" placeholder="0"
                                    value={transferForm.data.quantity}
                                    onChange={e => transferForm.setData('quantity', e.target.value)}
                                    required
                                />

                                {transferForm.errors.quantity && (
                                    <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[10px] text-rose-400">
                                        {transferForm.errors.quantity}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={transferForm.processing}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {transferForm.processing ? t('stockMgmt.transferring') : '⇄ ' + t('stockMgmt.transferBtn')}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Stock ledger */}
                <div className="space-y-3 rounded-3xl border border-slate-850 bg-slate-900 p-4 shadow-xl">
                    <SectionHeading icon="◆" label={t('stockMgmt.currentStock')} badge={t('common.live')} />

                    {/* Search */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-slate-500">🔍</span>
                        <input
                            type="text"
                            placeholder={t('stock.searchPlaceholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-300 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Outlet pills */}
                    {outlets.length > 1 && (
                        <div className="flex space-x-1.5 overflow-x-auto pb-1">
                            {outletCodes.map(code => (
                                <button
                                    key={code}
                                    onClick={() => setOutletFilter(code)}
                                    className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-bold transition-all ${outletFilter === code ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Rows */}
                    <div className="space-y-2">
                        {filtered.length === 0 ? (
                            <p className="py-4 text-center text-xs text-slate-600">{t('stockMgmt.noStock')}</p>
                        ) : filtered.map(s => (
                            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold text-slate-200">
                                        {s.product.brand.name} {s.product.name}
                                    </p>
                                    <p className="text-[9px] text-slate-500">
                                        {s.product.category.name} • {s.outlet.code}{s.product.model_number ? ` • ${s.product.model_number}` : ''}{s.product.warranty ? ` • ${s.product.warranty}` : ''}
                                    </p>
                                    {s.product.type && (
                                        <p className="text-[9px] text-slate-600">{s.product.type}</p>
                                    )}
                                </div>
                                <div className="ml-3 flex items-center gap-2">
                                    <span className={`rounded-xl px-2 py-1 text-[10px] font-black ${Number(s.quantity) > 2 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {Number(s.quantity).toLocaleString()} {t('stock.pcs')}
                                    </span>
                                    <button
                                        onClick={() => openEdit(s)}
                                        className="rounded-xl bg-slate-800 p-1.5 text-slate-400 transition-all hover:text-indigo-400"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit qty modal */}
            {editingStock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="flex items-center gap-1.5 text-sm font-black text-indigo-400">
                                <Pencil className="h-4 w-4" /> {t('stockMgmt.editQty')}
                            </h3>
                            <button onClick={() => setEditingStock(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                            <p className="text-[11px] font-bold text-slate-200">{editingStock.product.brand.name} {editingStock.product.name}</p>
                            <p className="text-[9px] text-slate-500">{editingStock.product.category.name} • {editingStock.outlet.code}</p>
                        </div>

                        <FormInput
                            label={t('stockMgmt.newQty')}
                            type="number" min={0} step="0.01"
                            value={editQty}
                            onChange={e => setEditQty(e.target.value)}
                            autoFocus
                        />

                        <button
                            onClick={handleSaveQty}
                            className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700"
                        >
                            {t('stockMgmt.saveQty')}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Product modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="my-4 w-full max-w-sm space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-indigo-400">{t('productMgmt.addNew')}</h3>
                            <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-3">
                            <FormInput label={t('productMgmt.productName') + ' *'} placeholder={t('productMgmt.namePlaceholder')} value={productForm.data.name} onChange={e => productForm.setData('name', e.target.value)} required />

                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label={t('productMgmt.modelNumber')} placeholder={t('productMgmt.modelPlaceholder')} value={productForm.data.model_number} onChange={e => productForm.setData('model_number', e.target.value)} />
                                <FormInput label={t('productMgmt.type')} placeholder={t('productMgmt.typePlaceholder')} value={productForm.data.type} onChange={e => productForm.setData('type', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <FormSelect label={t('productMgmt.brand') + ' *'} value={productForm.data.brand_id} onChange={e => productForm.setData('brand_id', Number(e.target.value))} required>
                                    <option value="">{t('productMgmt.selectBrand')}</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </FormSelect>
                                <FormSelect label={t('productMgmt.category') + ' *'} value={productForm.data.category_id} onChange={e => productForm.setData('category_id', Number(e.target.value))} required>
                                    <option value="">{t('productMgmt.selectCategory')}</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </FormSelect>
                            </div>

                            <FormInput label={t('productMgmt.warranty')} placeholder={t('productMgmt.warrantyPlaceholder')} value={productForm.data.warranty} onChange={e => productForm.setData('warranty', e.target.value)} />

                            <p className="text-[9px] text-slate-600">Product will be saved without outlet assignment — add it to stock using the form above.</p>

                            <button
                                type="submit"
                                disabled={productForm.processing}
                                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {productForm.processing ? t('productMgmt.creating') : '✓ ' + t('productMgmt.createBtn')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
