import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DayPicker, type DateRange } from 'react-day-picker';
import { CalendarDays, X } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import 'react-day-picker/dist/style.css';

// ─── Types ───────────────────────────────────────────────────────────────────

type DailySale  = { date: string; revenue: string; orders: number };
type TopProduct = { product_id: number; revenue: string; qty: string; orders: number; product: { name: string; model_number: string | null; brand: { name: string } } };
type StockItem  = { id: number; quantity: string; product: { name: string; model_number: string | null }; outlet: { name: string; code: string } };

type Props = {
    from: string;
    to: string;
    totalRevenue: number;
    totalOrders: number;
    ordersByStatus: Record<string, number>;
    ordersByPayment: Record<string, number>;
    topProducts: TopProduct[];
    dailySales: DailySale[];
    maintTotal: number;
    maintByStatus: Record<string, number>;
    lowStock: StockItem[];
    outOfStock: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    `रू ${n.toLocaleString('en-NP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-amber-500/20  text-amber-300',
    confirm:    'bg-blue-500/20   text-blue-300',
    dispatched: 'bg-indigo-500/20 text-indigo-300',
    delivered:  'bg-emerald-500/20 text-emerald-300',
    canceled:   'bg-rose-500/20   text-rose-300',
};

const PAYMENT_COLORS: Record<string, string> = {
    cash:        'bg-emerald-500/20 text-emerald-300',
    cheque:      'bg-blue-500/20   text-blue-300',
    online:      'bg-violet-500/20 text-violet-300',
    credit:      'bg-amber-500/20  text-amber-300',
    installment: 'bg-orange-500/20 text-orange-300',
};

function parseDate(s: string) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplay(s: string) {
    const d = parseDate(s);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: DailySale[] }) {
    if (data.length < 2) return null;
    const values = data.map(d => Number(d.revenue));
    const max = Math.max(...values, 1);
    const W = 280, H = 40;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - (v / max) * H;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 40 }}>
            <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home({ from, to, totalRevenue, totalOrders, ordersByStatus, ordersByPayment, topProducts, dailySales, maintTotal, maintByStatus, lowStock, outOfStock }: Props) {
    const { t } = useTranslation();
    const [showPicker, setShowPicker] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>({
        from: parseDate(from),
        to:   parseDate(to),
    });

    const applyRange = (r: DateRange | undefined) => {
        if (!r?.from) return;
        const f = formatDate(r.from);
        const t2 = r.to ? formatDate(r.to) : f;
        router.get('/home', { from: f, to: t2 }, { preserveState: false });
        setShowPicker(false);
    };

    const totalMaintOpen = (maintByStatus['received'] ?? 0) + (maintByStatus['in_progress'] ?? 0);

    return (
        <PosShell activeNav="home">
            <Head title={t('tabs.home')} />

            <div className="space-y-4 p-4 pb-8">

                {/* Date range selector */}
                <button
                    onClick={() => setShowPicker(true)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left transition-all hover:border-indigo-500/40"
                >
                    <div className="flex items-center gap-2 text-slate-300">
                        <CalendarDays className="h-4 w-4 text-indigo-400" />
                        <span className="text-[11px] font-bold">{formatDisplay(from)}</span>
                        <span className="text-[10px] text-slate-500">→</span>
                        <span className="text-[11px] font-bold">{formatDisplay(to)}</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-400">Change</span>
                </button>

                {/* Top KPIs */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/70">Revenue</p>
                        <p className="mt-1 text-lg font-black text-indigo-300">{fmt(totalRevenue)}</p>
                        <p className="text-[9px] text-indigo-400/60">{totalOrders} orders</p>
                    </div>
                    <div className="grid grid-rows-2 gap-3">
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                            <p className="text-[9px] font-bold text-amber-400/70">Maintenance</p>
                            <p className="text-sm font-black text-amber-300">{maintTotal} cases</p>
                            <p className="text-[9px] text-amber-400/60">{totalMaintOpen} open</p>
                        </div>
                        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                            <p className="text-[9px] font-bold text-rose-400/70">Out of Stock</p>
                            <p className="text-sm font-black text-rose-300">{outOfStock} products</p>
                            <p className="text-[9px] text-rose-400/60">{lowStock.length} low stock</p>
                        </div>
                    </div>
                </div>

                {/* Revenue sparkline */}
                {dailySales.length > 1 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">◆ Daily Revenue</h3>
                        <Sparkline data={dailySales} />
                        <div className="mt-2 flex justify-between text-[8px] text-slate-600">
                            <span>{formatDisplay(dailySales[0].date)}</span>
                            <span>{formatDisplay(dailySales[dailySales.length - 1].date)}</span>
                        </div>
                    </div>
                )}

                {/* Orders by status */}
                {Object.keys(ordersByStatus).length > 0 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">◆ Orders by Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(ordersByStatus).map(([s, n]) => (
                                <div key={s} className={`rounded-xl px-3 py-1.5 ${STATUS_COLORS[s] ?? 'bg-slate-800 text-slate-300'}`}>
                                    <span className="text-[9px] font-bold capitalize">{s}</span>
                                    <span className="ml-1.5 text-[11px] font-black">{n}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders by payment type */}
                {Object.keys(ordersByPayment).length > 0 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">◆ Payment Methods</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(ordersByPayment).map(([p, n]) => (
                                <div key={p} className={`rounded-xl px-3 py-1.5 ${PAYMENT_COLORS[p] ?? 'bg-slate-800 text-slate-300'}`}>
                                    <span className="text-[9px] font-bold capitalize">{p}</span>
                                    <span className="ml-1.5 text-[11px] font-black">{n}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top products */}
                {topProducts.length > 0 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">◆ Top Products</h3>
                        <div className="space-y-2">
                            {topProducts.map((tp, i) => (
                                <div key={tp.product_id} className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-[9px] font-black text-indigo-400">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[10px] font-bold text-slate-300">
                                            {tp.product.brand.name} {tp.product.name}
                                            {tp.product.model_number ? ` (${tp.product.model_number})` : ''}
                                        </p>
                                        <p className="text-[9px] text-slate-500">Qty {Number(tp.qty).toLocaleString()} • {tp.orders} orders</p>
                                    </div>
                                    <p className="shrink-0 text-[11px] font-black text-indigo-400">{fmt(Number(tp.revenue))}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Low stock alert */}
                {lowStock.length > 0 && (
                    <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xl">
                        <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-rose-400">⚠ Low Stock Alert</h3>
                        <div className="space-y-1.5">
                            {lowStock.map(s => (
                                <div key={s.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-300">
                                            {s.product.name}{s.product.model_number ? ` (${s.product.model_number})` : ''}
                                        </p>
                                        <p className="text-[9px] text-slate-500">{s.outlet.code}</p>
                                    </div>
                                    <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-400">
                                        {Number(s.quantity).toLocaleString()} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Maintenance breakdown */}
                {Object.keys(maintByStatus).length > 0 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">◆ Maintenance by Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(maintByStatus).map(([s, n]) => (
                                <div key={s} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5">
                                    <span className="text-[9px] font-bold capitalize text-slate-400">{s.replace('_', ' ')}</span>
                                    <span className="ml-1.5 text-[11px] font-black text-slate-200">{n}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Date range picker modal */}
            {showPicker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/90 backdrop-blur-md sm:items-center">
                    <div className="w-full max-w-sm rounded-t-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:rounded-3xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black text-indigo-400">Select Date Range</h3>
                            <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <style>{`
                            .rdp { --rdp-accent-color: #6366f1; --rdp-background-color: #6366f1/20; margin: 0; }
                            .rdp-day { color: #cbd5e1; border-radius: 8px; }
                            .rdp-day:hover { background: #1e293b; }
                            .rdp-day_selected { background: #6366f1 !important; color: white !important; }
                            .rdp-day_range_middle { background: #312e81 !important; color: #a5b4fc !important; border-radius: 0; }
                            .rdp-day_range_start, .rdp-day_range_end { background: #6366f1 !important; color: white !important; }
                            .rdp-head_cell { color: #64748b; font-size: 10px; font-weight: 700; }
                            .rdp-caption_label { color: #e2e8f0; font-weight: 800; font-size: 13px; }
                            .rdp-nav_button { color: #94a3b8; }
                            .rdp-nav_button:hover { background: #1e293b; }
                            .rdp-months { background: transparent; }
                        `}</style>

                        <div className="flex justify-center">
                            <DayPicker
                                mode="range"
                                selected={range}
                                onSelect={setRange}
                                numberOfMonths={1}
                                toDate={new Date()}
                            />
                        </div>

                        <button
                            onClick={() => applyRange(range)}
                            disabled={!range?.from}
                            className="mt-3 w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-40"
                        >
                            Apply Range
                        </button>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
