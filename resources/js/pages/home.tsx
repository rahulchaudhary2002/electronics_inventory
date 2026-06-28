import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DayPicker, type DateRange } from 'react-day-picker';
import { CalendarDays, X } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import PosShell from '@/components/pos-shell';
import { useAuth } from '@/hooks/use-auth';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── Types ───────────────────────────────────────────────────────────────────

type DailySale  = { date: string; revenue: string; orders: number };
type TopProduct = { product_id: number; revenue: string; qty: string; orders: number; product: { name: string; model_number: string | null; brand: { name: string } } };
type StockItem  = { id: number; quantity: string; product: { name: string; model_number: string | null }; outlet: { name: string; code: string } };

type Outlet = { id: number; name: string; code: string };

type Props = {
    from: string;
    to: string;
    outletId: number | null;
    outlets: Outlet[];
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

const STATUS_HEX: Record<string, string> = {
    pending:    '#f59e0b',
    confirm:    '#3b82f6',
    dispatched: '#6366f1',
    delivered:  '#10b981',
    canceled:   '#f43f5e',
};

const PAYMENT_HEX: Record<string, string> = {
    cash:        '#10b981',
    cheque:      '#3b82f6',
    online:      '#8b5cf6',
    credit:      '#f59e0b',
    installment: '#f97316',
};

const MAINT_HEX: Record<string, string> = {
    received:    '#3b82f6',
    in_progress: '#f59e0b',
    resolved:    '#10b981',
    returned:    '#8b5cf6',
    canceled:    '#f43f5e',
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

export default function Home({ from, to, outletId, outlets, totalRevenue, totalOrders, ordersByStatus, ordersByPayment, topProducts, dailySales, maintTotal, maintByStatus, lowStock, outOfStock }: Props) {
    const { t } = useTranslation();
    const { isSuperadmin } = useAuth();
    const [showPicker, setShowPicker] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>({
        from: parseDate(from),
        to:   parseDate(to),
    });

    const navigate = (params: Record<string, string | number | null>) => {
        const base: Record<string, string | number> = { from, to };
        if (outletId) base.outlet_id = outletId;
        router.get('/home', { ...base, ...params }, { preserveState: false });
    };

    const applyRange = (r: DateRange | undefined) => {
        if (!r?.from) return;
        const f  = formatDate(r.from);
        const t2 = r.to ? formatDate(r.to) : f;
        navigate({ from: f, to: t2 });
        setShowPicker(false);
    };

    const applyOutlet = (id: number | null) => {
        const params: Record<string, string | number> = { from, to };
        if (id) params.outlet_id = id;
        router.get('/home', params, { preserveState: false });
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
                        <span className="text-sm font-semibold">{formatDisplay(from)}</span>
                        <span className="text-[10px] text-slate-500">→</span>
                        <span className="text-sm font-semibold">{formatDisplay(to)}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Change</span>
                </button>

                {/* Outlet filter — superadmin only */}
                {isSuperadmin && outlets.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Filter by Outlet</p>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => applyOutlet(null)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${!outletId ? 'bg-indigo-600 text-white' : 'border border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                All Outlets
                            </button>
                            {outlets.map(o => (
                                <button
                                    key={o.id}
                                    onClick={() => applyOutlet(o.id)}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${outletId === o.id ? 'bg-indigo-600 text-white' : 'border border-slate-700 text-slate-400 hover:text-white'}`}
                                >
                                    {o.name} <span className="opacity-60">({o.code})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top KPIs */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400/70">Revenue</p>
                        <p className="mt-1 text-lg font-black text-indigo-300">{fmt(totalRevenue)}</p>
                        <p className="text-xs text-indigo-400/60">{totalOrders} orders</p>
                    </div>
                    <div className="grid grid-rows-2 gap-3">
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                            <p className="text-[10px] font-semibold text-amber-400/70">Maintenance</p>
                            <p className="text-sm font-black text-amber-300">{maintTotal} cases</p>
                            <p className="text-xs text-amber-400/60">{totalMaintOpen} open</p>
                        </div>
                        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                            <p className="text-[10px] font-semibold text-rose-400/70">Out of Stock</p>
                            <p className="text-sm font-black text-rose-300">{outOfStock} products</p>
                            <p className="text-xs text-rose-400/60">{lowStock.length} low stock</p>
                        </div>
                    </div>
                </div>

                {/* Revenue sparkline */}
                {dailySales.length > 1 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">◆ Daily Revenue</h3>
                        <Sparkline data={dailySales} />
                        <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                            <span>{formatDisplay(dailySales[0].date)}</span>
                            <span>{formatDisplay(dailySales[dailySales.length - 1].date)}</span>
                        </div>
                    </div>
                )}

                {/* Orders by status + Payment methods side by side */}
                {(Object.keys(ordersByStatus).length > 0 || Object.keys(ordersByPayment).length > 0) && (
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(ordersByStatus).length > 0 && (
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">◆ By Status</h3>
                                <div className="relative mx-auto" style={{ maxWidth: 140 }}>
                                    <Doughnut
                                        data={{
                                            labels: Object.keys(ordersByStatus).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                                            datasets: [{
                                                data: Object.values(ordersByStatus),
                                                backgroundColor: Object.keys(ordersByStatus).map(s => STATUS_HEX[s] ?? '#475569'),
                                                borderColor: '#0f172a',
                                                borderWidth: 2,
                                                hoverOffset: 4,
                                            }],
                                        }}
                                        options={{
                                            cutout: '68%',
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#1e293b',
                                                    titleColor: '#94a3b8',
                                                    bodyColor: '#f1f5f9',
                                                    borderColor: '#334155',
                                                    borderWidth: 1,
                                                },
                                            },
                                        }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-lg font-black text-slate-100">{totalOrders}</p>
                                        <p className="text-[10px] font-semibold text-slate-500">orders</p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    {Object.entries(ordersByStatus).map(([s, n]) => (
                                        <div key={s} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_HEX[s] ?? '#475569' }} />
                                                <span className="text-[10px] capitalize text-slate-400">{s}</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-300">{n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Object.keys(ordersByPayment).length > 0 && (
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">◆ Payment</h3>
                                <div className="relative mx-auto" style={{ maxWidth: 140 }}>
                                    <Doughnut
                                        data={{
                                            labels: Object.keys(ordersByPayment).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                                            datasets: [{
                                                data: Object.values(ordersByPayment),
                                                backgroundColor: Object.keys(ordersByPayment).map(p => PAYMENT_HEX[p] ?? '#475569'),
                                                borderColor: '#0f172a',
                                                borderWidth: 2,
                                                hoverOffset: 4,
                                            }],
                                        }}
                                        options={{
                                            cutout: '68%',
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#1e293b',
                                                    titleColor: '#94a3b8',
                                                    bodyColor: '#f1f5f9',
                                                    borderColor: '#334155',
                                                    borderWidth: 1,
                                                },
                                            },
                                        }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-lg font-black text-slate-100">{totalOrders}</p>
                                        <p className="text-[10px] font-semibold text-slate-500">orders</p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    {Object.entries(ordersByPayment).map(([p, n]) => (
                                        <div key={p} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full" style={{ background: PAYMENT_HEX[p] ?? '#475569' }} />
                                                <span className="text-[10px] capitalize text-slate-400">{p}</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-300">{n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Top products — horizontal bar chart */}
                {topProducts.length > 0 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">◆ Top Products by Revenue</h3>
                        <Bar
                            data={{
                                labels: topProducts.map(tp =>
                                    `${tp.product.brand.name} ${tp.product.name}${tp.product.model_number ? ` (${tp.product.model_number})` : ''}`
                                ),
                                datasets: [{
                                    label: 'Revenue',
                                    data: topProducts.map(tp => Number(tp.revenue)),
                                    backgroundColor: 'rgba(99,102,241,0.7)',
                                    borderColor: '#6366f1',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    borderSkipped: false,
                                }],
                            }}
                            options={{
                                indexAxis: 'y',
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: '#1e293b',
                                        titleColor: '#94a3b8',
                                        bodyColor: '#f1f5f9',
                                        borderColor: '#334155',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: ctx => ` रू ${Number(ctx.raw).toLocaleString('en-NP')}`,
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        grid: { color: '#1e293b' },
                                        ticks: { color: '#64748b', font: { size: 9 }, callback: v => `रू ${Number(v).toLocaleString('en-NP')}` },
                                    },
                                    y: {
                                        grid: { display: false },
                                        ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 0 },
                                    },
                                },
                            }}
                        />
                    </div>
                )}

                {/* Low stock alert */}
                {lowStock.length > 0 && (
                    <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xl">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-rose-400">⚠ Low Stock Alert</h3>
                        <div className="space-y-1.5">
                            {lowStock.map(s => (
                                <div key={s.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-300">
                                            {s.product.name}{s.product.model_number ? ` (${s.product.model_number})` : ''}
                                        </p>
                                        <p className="text-[10px] text-slate-500">{s.outlet.code}</p>
                                    </div>
                                    <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                                        {Number(s.quantity).toLocaleString()} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Maintenance by status — doughnut */}
                {Object.keys(maintByStatus).length > 0 && (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">◆ Maintenance by Status</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
                                <Doughnut
                                    data={{
                                        labels: Object.keys(maintByStatus).map(s => s.replace('_', ' ')),
                                        datasets: [{
                                            data: Object.values(maintByStatus),
                                            backgroundColor: Object.keys(maintByStatus).map(s => MAINT_HEX[s] ?? '#475569'),
                                            borderColor: '#0f172a',
                                            borderWidth: 2,
                                            hoverOffset: 4,
                                        }],
                                    }}
                                    options={{
                                        cutout: '68%',
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: '#1e293b',
                                                titleColor: '#94a3b8',
                                                bodyColor: '#f1f5f9',
                                                borderColor: '#334155',
                                                borderWidth: 1,
                                            },
                                        },
                                    }}
                                />
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-base font-black text-slate-100">{maintTotal}</p>
                                    <p className="text-[10px] font-semibold text-slate-500">cases</p>
                                </div>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                {Object.entries(maintByStatus).map(([s, n]) => (
                                    <div key={s} className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full" style={{ background: MAINT_HEX[s] ?? '#475569' }} />
                                            <span className="text-[10px] capitalize text-slate-400">{s.replace('_', ' ')}</span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-300">{n}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Date range picker modal */}
            {showPicker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-t-3xl border border-slate-700/60 bg-slate-900 shadow-2xl">
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="h-1 w-10 rounded-full bg-slate-700" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-3 pt-2 border-b border-slate-800">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Filter Period</p>
                                <h3 className="text-sm font-black text-white">Select Date Range</h3>
                            </div>
                            <button
                                onClick={() => setShowPicker(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Calendar */}
                        <div className="px-4 py-3">
                            <DayPicker
                                mode="range"
                                selected={range}
                                onSelect={setRange}
                                numberOfMonths={1}
                                disabled={{ after: new Date() }}
                                classNames={{
                                    months:         'flex flex-col',
                                    month:          'w-full',
                                    month_caption:  'flex items-center justify-between px-1 mb-3',
                                    caption_label:  'text-sm font-black text-slate-100',
                                    nav:            'flex items-center gap-1',
                                    button_previous:'flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all text-xs',
                                    button_next:    'flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all text-xs',
                                    month_grid:     'w-full border-collapse',
                                    weekdays:       'flex mb-1',
                                    weekday:        'flex-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-600 py-1',
                                    weeks:          'flex flex-col gap-0.5',
                                    week:           'flex',
                                    day:            'flex-1 flex items-center justify-center p-0',
                                    day_button:     'w-full h-8 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer',
                                    today:          'font-black text-indigo-400',
                                    selected:       '[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:font-bold',
                                    range_start:    '[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:rounded-l-lg [&>button]:rounded-r-none [&>button]:font-bold',
                                    range_end:      '[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:rounded-r-lg [&>button]:rounded-l-none [&>button]:font-bold',
                                    range_middle:   '[&>button]:bg-indigo-500/15 [&>button]:text-indigo-300 [&>button]:rounded-none hover:[&>button]:bg-indigo-500/25',
                                    disabled:       '[&>button]:opacity-25 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
                                    outside:        '[&>button]:text-slate-700',
                                }}
                            />
                        </div>

                        {/* Selected range display */}
                        {range?.from && (
                            <div className="mx-4 mb-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">From</p>
                                    <p className="text-sm font-bold text-indigo-400">{formatDisplay(formatDate(range.from))}</p>
                                </div>
                                <div className="h-6 w-px bg-slate-800" />
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">To</p>
                                    <p className="text-sm font-bold text-indigo-400">
                                        {range.to ? formatDisplay(formatDate(range.to)) : '—'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quick presets */}
                        <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                            {[
                                { label: 'Today',      days: 0 },
                                { label: 'Last 7d',    days: 6 },
                                { label: 'Last 30d',   days: 29 },
                            ].map(({ label, days }) => (
                                <button
                                    key={label}
                                    onClick={() => {
                                        const to   = new Date();
                                        const from = new Date(); from.setDate(from.getDate() - days);
                                        setRange({ from, to });
                                    }}
                                    className="rounded-xl border border-slate-800 bg-slate-800/60 py-1.5 text-[10px] font-semibold text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 transition-all"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Apply */}
                        <div className="px-4 pb-6">
                            <button
                                onClick={() => applyRange(range)}
                                disabled={!range?.from}
                                className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40"
                            >
                                Apply Range
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
