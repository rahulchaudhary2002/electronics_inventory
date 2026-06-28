import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Pencil, Search, X, Image } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import * as ordersRoute from '@/routes/orders';

// ─── Types ───────────────────────────────────────────────────────────────────

type Outlet  = { id: number; name: string; code: string };
type Brand   = { id: number; name: string };
type Product = { id: number; name: string; model_number: string | null; brand: Brand };

type Payment = {
    id: number;
    advance_amount: string | null;
    remaining_amount: string | null;
    due_date: string | null;
    down_payment: string | null;
    installment_months: number | null;
    monthly_installment: string | null;
};

type Order = {
    id: number;
    customer_name: string;
    customer_mobile: string;
    customer_address: string | null;
    price: string;
    quantity: string;
    payment_type: 'cash' | 'cheque' | 'online' | 'credit' | 'installment';
    status: 'pending' | 'confirm' | 'dispatched' | 'delivered' | 'canceled';
    warranty_card: string | null;
    warranty_card_url: string | null;
    created_at: string;
    origin_outlet: Outlet;
    destination_outlet: Outlet;
    product: Product;
    payment: Payment | null;
};

type Props = {
    orders: Order[];
    outlets: Outlet[];
    flash?: { success?: string };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LIST = ['pending', 'confirm', 'dispatched', 'delivered', 'canceled'] as const;

const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-amber-500/10  text-amber-400  border border-amber-500/20',
    confirm:    'bg-blue-500/10   text-blue-400   border border-blue-500/20',
    dispatched: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    delivered:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    canceled:   'bg-rose-500/10   text-rose-400   border border-rose-500/20',
};

const PAYMENT_COLORS: Record<string, string> = {
    cash:        'text-emerald-400',
    cheque:      'text-blue-400',
    online:      'text-violet-400',
    credit:      'text-amber-400',
    installment: 'text-orange-400',
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function Orders({ orders, flash }: Props) {
    const { t } = useTranslation();

    const [search, setSearch]             = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus]       = useState<string>('');

    const filtered = useMemo(() =>
        orders.filter(o => {
            const matchStatus = statusFilter === 'all' || o.status === statusFilter;
            const q = search.toLowerCase();
            const matchSearch = !q ||
                o.customer_name.toLowerCase().includes(q) ||
                o.customer_mobile.includes(q) ||
                o.product.name.toLowerCase().includes(q) ||
                o.product.brand.name.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        }),
    [orders, search, statusFilter]);

    const stats = useMemo(() => ({
        yetToDeliver: orders.filter(o => o.status === 'pending' || o.status === 'confirm').length,
        onProcess:    orders.filter(o => o.status === 'dispatched').length,
        delivered:    orders.filter(o => o.status === 'delivered').length,
    }), [orders]);

    const fmt = (n: number) =>
        `रू ${n.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const openStatusEdit = (order: Order) => {
        setEditingOrder(order);
        setNewStatus(order.status);
    };

    const handleStatusSave = () => {
        if (!editingOrder) return;
        router.put(ordersRoute.update(editingOrder.id).url, { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => setEditingOrder(null),
        });
    };

    return (
        <PosShell title={t('orderMgmt.title')} backHref="/menu" activeNav="menu">
            <Head title={t('orderMgmt.title')} />

            <div className="space-y-6 px-4 py-5 md:px-6">
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                        className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-center transition-all hover:border-amber-500/40"
                    >
                        <p className="text-lg font-black text-amber-400">{stats.yetToDeliver}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-500/70">Yet to Deliver</p>
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'dispatched' ? 'all' : 'dispatched')}
                        className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-center transition-all hover:border-indigo-500/40"
                    >
                        <p className="text-lg font-black text-indigo-400">{stats.onProcess}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500/70">On Process</p>
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'delivered' ? 'all' : 'delivered')}
                        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center transition-all hover:border-emerald-500/40"
                    >
                        <p className="text-lg font-black text-emerald-400">{stats.delivered}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500/70">Delivered</p>
                    </button>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                    <div className="mb-5 flex items-center justify-between border-b border-slate-800/60 pb-4">
                        <h3 className="text-sm font-bold text-white">{t('orderMgmt.orderList')}</h3>
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">{filtered.length}</span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                            <Search className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search customer, product..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-300 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Status filter pills */}
                    <div className="mb-4 flex space-x-1.5 overflow-x-auto pb-1">
                        {(['all', ...STATUS_LIST] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                            >
                                {s === 'all' ? 'All' : t(`orderMgmt.${s}`)}
                            </button>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800">
                                    <Search className="h-5 w-5 text-slate-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-500">{t('orderMgmt.noOrders')}</p>
                            </div>
                        ) : filtered.map(o => (
                            <div key={o.id} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-slate-700">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-white">{o.customer_name}</p>
                                        <p className="text-xs text-slate-500">
                                            {o.customer_mobile}{o.customer_address ? ` • ${o.customer_address}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[o.status]}`}>
                                            {t(`orderMgmt.${o.status}`)}
                                        </span>
                                        <span className={`text-[10px] font-semibold ${PAYMENT_COLORS[o.payment_type]}`}>
                                            {t(`orderMgmt.${o.payment_type}`)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-200">
                                            {o.product.brand.name} {o.product.name}
                                            {o.product.model_number ? ` (${o.product.model_number})` : ''}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {o.origin_outlet.code} → {o.destination_outlet.code} • #{o.id} • Qty: {Number(o.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-indigo-400">{fmt(Number(o.price))}</p>
                                </div>

                                {/* Payment summary */}
                                {o.payment && o.payment_type === 'credit' && (
                                    <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 space-y-0.5">
                                        <p>Advance: {fmt(Number(o.payment.advance_amount ?? 0))} • Due: {fmt(Number(o.payment.remaining_amount ?? 0))}</p>
                                        {o.payment.due_date && <p>Due date: {o.payment.due_date}</p>}
                                    </div>
                                )}
                                {o.payment && o.payment_type === 'installment' && (
                                    <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 px-3 py-2 text-xs text-orange-400 space-y-0.5">
                                        <p>Down: {fmt(Number(o.payment.down_payment ?? 0))} • {o.payment.installment_months}mo × {fmt(Number(o.payment.monthly_installment ?? 0))}/mo</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-2">
                                    {o.warranty_card_url ? (
                                        <a href={o.warranty_card_url} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-400 hover:text-indigo-400">
                                            <Image className="h-3 w-3" /> Warranty
                                        </a>
                                    ) : <span />}
                                    <button
                                        onClick={() => openStatusEdit(o)}
                                        className="flex items-center gap-1 rounded-xl bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-all"
                                    >
                                        <Pencil className="h-3 w-3" /> {t('orderMgmt.updateStatus')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Status update modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                                    <Pencil className="h-4 w-4 text-indigo-400" />
                                </div>
                                <h2 className="font-black text-white">{t('orderMgmt.updateStatus')}</h2>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-800 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="font-semibold text-white">{editingOrder.customer_name}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {editingOrder.product.brand.name} {editingOrder.product.name} • {editingOrder.origin_outlet.code} → {editingOrder.destination_outlet.code}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5">
                                {STATUS_LIST.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setNewStatus(s)}
                                        className={`rounded-2xl py-2.5 text-xs font-semibold transition-all ${newStatus === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'}`}
                                    >
                                        {t(`orderMgmt.${s}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-800 px-6 py-4">
                            <button
                                onClick={handleStatusSave}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
                            >
                                {t('orderMgmt.updateStatus')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
