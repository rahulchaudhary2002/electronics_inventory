import { Head } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import PosShell from '@/components/pos-shell';

// ─── Types ───────────────────────────────────────────────────────────────────

type Outlet = {
    id: string;
    name: string;
    location: string;
    code: string;
};

type InventoryItem = {
    id: string;
    brand: string;
    category: string;
    name: string;
    model: string;
    type: string;
    warranty: string;
    costPrice: number;
    sellingPrice: number;
    outlet: string;
    qty: number;
};

type StockAction = 'directAdd' | 'transferStock';

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_OUTLETS: Outlet[] = [
    { id: '1', name: 'Main Store', location: 'Main Hub',   code: 'Main Store' },
    { id: '2', name: 'Outlet S1', location: 'Kathmandu',   code: 'S1' },
    { id: '3', name: 'Outlet S2', location: 'Lalitpur',    code: 'S2' },
    { id: '4', name: 'Outlet S3', location: 'Bhaktapur',   code: 'S3' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 'inv-1', brand: 'Sony',    category: 'Smart TV / LED',        name: 'Bravia 4K LED',     model: 'KD-55X75K',     type: 'LED 4K',   warranty: '1 Year',  costPrice: 55000, sellingPrice: 68000, outlet: 'Main Store', qty: 5 },
    { id: 'inv-2', brand: 'LG',      category: 'Refrigerator (Freeze)', name: 'InstaView Fridge',  model: 'GN-H702HQHM',   type: 'Inverter', warranty: '2 Years', costPrice: 70000, sellingPrice: 88000, outlet: 'S1',        qty: 3 },
    { id: 'inv-3', brand: 'Samsung', category: 'Washing Machine',       name: 'Digital Inverter',  model: 'WA65T4262BS',   type: 'Top-Load', warranty: '1 Year',  costPrice: 28000, sellingPrice: 35000, outlet: 'S2',        qty: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupee(n: number) { return `रू ${n.toLocaleString('ne-NP')}`; }
function genId(prefix: string)  { return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`; }

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

export default function Dashboard() {
    const { t } = useTranslation();

    const [stockAction, setStockAction] = useState<StockAction>('directAdd');
    const [outlets]   = useState<Outlet[]>(INITIAL_OUTLETS);
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

    const [stockSearch, setStockSearch]           = useState('');
    const [stockOutletFilter, setStockOutletFilter] = useState('All');
    const [showEditProduct, setShowEditProduct]   = useState<InventoryItem | null>(null);

    const [directForm, setDirectForm] = useState({
        brand: '', category: 'Smart TV / LED', name: '', model: '',
        type: '', warranty: '1 Year', costPrice: 50000, sellingPrice: 65000,
        outlet: 'Main Store', qty: 5,
    });

    const [transferForm, setTransferForm] = useState({
        itemId: INITIAL_INVENTORY[0]?.id ?? '', qty: 1, fromOutlet: 'Main Store', toOutlet: 'S1',
    });

    const categories = [
        t('categories.smartTv'), t('categories.refrigerator'),
        t('categories.microwave'), t('categories.deepFreezer'), t('categories.washingMachine'),
    ];

    const outletCodes = useMemo(() => ['All', ...outlets.map((o) => o.code)], [outlets]);

    const filteredInventory = useMemo(() =>
        inventory.filter((item) => {
            const matchesOutlet = stockOutletFilter === 'All' || item.outlet === stockOutletFilter;
            const q = stockSearch.toLowerCase();
            const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
            return matchesOutlet && matchesSearch;
        }),
        [inventory, stockSearch, stockOutletFilter]
    );

    const handleDirectStockAdd = useCallback(() => {
        if (!directForm.brand || !directForm.name) return;
        const newItem: InventoryItem = {
            id: genId('inv'),
            brand: directForm.brand, category: directForm.category, name: directForm.name,
            model: directForm.model, type: directForm.type, warranty: directForm.warranty,
            costPrice: Number(directForm.costPrice), sellingPrice: Number(directForm.sellingPrice),
            outlet: directForm.outlet, qty: Number(directForm.qty),
        };
        setInventory((prev) => [...prev, newItem]);
        setDirectForm((f) => ({ ...f, brand: '', name: '', model: '', type: '' }));
    }, [directForm]);

    const handleTransfer = useCallback(() => {
        const item = inventory.find((i) => i.id === transferForm.itemId);
        if (!item || item.outlet !== transferForm.fromOutlet || item.qty < transferForm.qty) return;
        setInventory((prev) =>
            prev.map((i) => {
                if (i.id === item.id) return { ...i, qty: i.qty - transferForm.qty };
                if (i.outlet === transferForm.toOutlet && i.name === item.name) return { ...i, qty: i.qty + transferForm.qty };
                return i;
            })
        );
    }, [inventory, transferForm]);

    const OutletPills = ({ selected, onChange }: { selected: string; onChange: (code: string) => void }) => (
        <div className="flex space-x-1.5 overflow-x-auto pb-1">
            {outletCodes.map((code) => (
                <button key={code} onClick={() => onChange(code)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-bold transition-all ${selected === code ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                >
                    {code}
                </button>
            ))}
        </div>
    );

    return (
        <PosShell activeNav="store">
            <Head title={t('tabs.store')} />

            <div className="space-y-4 p-4">
                {/* Action toggles */}
                <div className="grid grid-cols-2 gap-0 rounded-2xl border border-slate-850 bg-slate-900 p-1">
                    <button
                        onClick={() => setStockAction('directAdd')}
                        className={`rounded-xl py-2.5 text-[11px] font-bold transition-all ${stockAction === 'directAdd' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        + {t('stock.newStock')}
                    </button>
                    <button
                        onClick={() => setStockAction('transferStock')}
                        className={`rounded-xl py-2.5 text-[11px] font-bold transition-all ${stockAction === 'transferStock' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        ⇄ {t('stock.transferStock')}
                    </button>
                </div>

                {/* Direct add form */}
                {stockAction === 'directAdd' && (
                    <div className="space-y-4 rounded-3xl border border-slate-850 bg-slate-900 p-4 shadow-xl">
                        <SectionHeading icon="↓" label={t('stock.directAddTitle')} />
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label={t('stock.brand')} placeholder={t('stock.brandPlaceholder')} value={directForm.brand} onChange={(e) => setDirectForm((f) => ({ ...f, brand: e.target.value }))} />
                                <FormSelect label={t('stock.category')} value={directForm.category} onChange={(e) => setDirectForm((f) => ({ ...f, category: e.target.value }))}>
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </FormSelect>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label={t('stock.productName')} placeholder={t('stock.namePlaceholder')} value={directForm.name} onChange={(e) => setDirectForm((f) => ({ ...f, name: e.target.value }))} />
                                <FormInput label={t('stock.modelNo')} placeholder={t('stock.modelPlaceholder')} value={directForm.model} onChange={(e) => setDirectForm((f) => ({ ...f, model: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label={t('stock.type')} placeholder={t('stock.typePlaceholder')} value={directForm.type} onChange={(e) => setDirectForm((f) => ({ ...f, type: e.target.value }))} />
                                <FormInput label={t('stock.warranty')} value={directForm.warranty} onChange={(e) => setDirectForm((f) => ({ ...f, warranty: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label={t('stock.costPrice')} type="number" value={directForm.costPrice} onChange={(e) => setDirectForm((f) => ({ ...f, costPrice: Number(e.target.value) }))} />
                                <FormInput label={t('stock.sellingPrice')} type="number" value={directForm.sellingPrice} onChange={(e) => setDirectForm((f) => ({ ...f, sellingPrice: Number(e.target.value) }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormSelect label={t('stock.targetStore')} value={directForm.outlet} onChange={(e) => setDirectForm((f) => ({ ...f, outlet: e.target.value }))}>
                                    {outlets.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                                </FormSelect>
                                <FormInput label={t('stock.quantity')} type="number" min={1} value={directForm.qty} onChange={(e) => setDirectForm((f) => ({ ...f, qty: Number(e.target.value) }))} />
                            </div>
                            <button onClick={handleDirectStockAdd} className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-[0.98]">
                                ✓ {t('stock.addStockBtn')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Transfer form */}
                {stockAction === 'transferStock' && (
                    <div className="space-y-4 rounded-3xl border border-slate-850 bg-slate-900 p-4 shadow-xl">
                        <SectionHeading icon="⇄" label={t('stock.transferTitle')} />
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <FormSelect label={t('stock.transferItem')} value={transferForm.itemId} onChange={(e) => setTransferForm((f) => ({ ...f, itemId: e.target.value }))}>
                                    {inventory.map((i) => <option key={i.id} value={i.id}>{i.brand} {i.name} ({i.outlet})</option>)}
                                </FormSelect>
                                <FormInput label={t('stock.transferQty')} type="number" min={1} value={transferForm.qty} onChange={(e) => setTransferForm((f) => ({ ...f, qty: Number(e.target.value) }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormSelect label={t('stock.fromStore')} value={transferForm.fromOutlet} onChange={(e) => setTransferForm((f) => ({ ...f, fromOutlet: e.target.value }))}>
                                    {outlets.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                                </FormSelect>
                                <FormSelect label={t('stock.toStore')} value={transferForm.toOutlet} onChange={(e) => setTransferForm((f) => ({ ...f, toOutlet: e.target.value }))}>
                                    {outlets.filter((o) => o.code !== transferForm.fromOutlet).map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                                </FormSelect>
                            </div>
                            <button onClick={handleTransfer} className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-all hover:bg-indigo-700 active:scale-[0.98]">
                                ⇄ {t('stock.transferBtn')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Live stock ledger */}
                <div className="space-y-3 rounded-3xl border border-slate-850 bg-slate-900 p-4 shadow-xl">
                    <SectionHeading icon="◆" label={t('stock.stockLedger')} badge={t('common.live')} />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-slate-500">🔍</span>
                        <input
                            type="text"
                            placeholder={t('stock.searchPlaceholder')}
                            value={stockSearch}
                            onChange={(e) => setStockSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-300 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <OutletPills selected={stockOutletFilter} onChange={setStockOutletFilter} />
                    <div className="space-y-2">
                        {filteredInventory.length === 0 ? (
                            <p className="py-4 text-center text-xs text-slate-600">{t('stock.noStock')}</p>
                        ) : (
                            filteredInventory.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[11px] font-bold text-slate-200">{item.brand} {item.name}</p>
                                        <p className="text-[9px] text-slate-500">{item.category} • {item.outlet} • {item.model}</p>
                                        <p className="mt-0.5 text-[10px] font-bold text-indigo-400">{formatRupee(item.sellingPrice)}</p>
                                    </div>
                                    <div className="ml-3 flex items-center gap-2">
                                        <span className={`rounded-xl px-2 py-1 text-[10px] font-black ${item.qty > 2 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {item.qty} {t('stock.pcs')}
                                        </span>
                                        <button onClick={() => setShowEditProduct(item)} className="rounded-xl bg-slate-800 p-1.5 text-slate-400 hover:text-indigo-400 transition-all">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Edit product modal */}
            {showEditProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm animate-[slideUp_0.3s_ease-out] space-y-3 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="flex items-center gap-1.5 text-sm font-black text-indigo-400"><Pencil className="h-4 w-4" /> {t('stock.editProduct')}</h3>
                            <button onClick={() => setShowEditProduct(null)} className="text-lg text-slate-400 hover:text-white">✕</button>
                        </div>
                        <FormInput label={t('stock.brand')} value={showEditProduct.brand} onChange={(e) => setShowEditProduct((p) => p ? { ...p, brand: e.target.value } : null)} />
                        <FormInput label={t('stock.nameDesc')} value={showEditProduct.name} onChange={(e) => setShowEditProduct((p) => p ? { ...p, name: e.target.value } : null)} />
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput label={t('stock.model')} value={showEditProduct.model} onChange={(e) => setShowEditProduct((p) => p ? { ...p, model: e.target.value } : null)} />
                            <FormInput label={t('stock.type')} value={showEditProduct.type} onChange={(e) => setShowEditProduct((p) => p ? { ...p, type: e.target.value } : null)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput label={t('stock.costPrice')} type="number" value={showEditProduct.costPrice} onChange={(e) => setShowEditProduct((p) => p ? { ...p, costPrice: Number(e.target.value) } : null)} />
                            <FormInput label={t('stock.sellingPrice')} type="number" value={showEditProduct.sellingPrice} onChange={(e) => setShowEditProduct((p) => p ? { ...p, sellingPrice: Number(e.target.value) } : null)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput label={t('stock.warranty')} value={showEditProduct.warranty} onChange={(e) => setShowEditProduct((p) => p ? { ...p, warranty: e.target.value } : null)} />
                            <FormInput label={t('stock.stockQty')} type="number" value={showEditProduct.qty} onChange={(e) => setShowEditProduct((p) => p ? { ...p, qty: Number(e.target.value) } : null)} />
                        </div>
                        <button
                            onClick={() => {
                                if (!showEditProduct) return;
                                setInventory((prev) => prev.map((i) => i.id === showEditProduct.id ? showEditProduct : i));
                                setShowEditProduct(null);
                            }}
                            className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700"
                        >
                            {t('stock.saveProduct')}
                        </button>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
