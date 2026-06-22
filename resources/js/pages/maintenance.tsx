import { Head, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, X } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import { useAuth } from '@/hooks/use-auth';
import * as maintenancesRoute from '@/routes/maintenances';

// ─── Types ───────────────────────────────────────────────────────────────────

type Outlet = { id: number; name: string; code: string };

type MaintenanceRecord = {
    id: number;
    product_name: string;
    product_model: string | null;
    customer_name: string;
    customer_mobile: string;
    customer_address: string | null;
    case_type: 'warranty_repair' | 'exchange_return' | 'paid_service';
    problem: string;
    status: 'received' | 'in_progress' | 'resolved' | 'returned' | 'canceled';
    created_at: string;
    outlet: Outlet;
};

type Props = {
    maintenances: MaintenanceRecord[];
    outlets: Outlet[];
    flash?: { success?: string };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CASE_TYPES   = ['warranty_repair', 'exchange_return', 'paid_service'] as const;
const STATUS_LIST  = ['received', 'in_progress', 'resolved', 'returned', 'canceled'] as const;

const STATUS_COLORS: Record<string, string> = {
    received:    'bg-blue-500/10   text-blue-400   border border-blue-500/20',
    in_progress: 'bg-amber-500/10  text-amber-400  border border-amber-500/20',
    resolved:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    returned:    'bg-violet-500/10 text-violet-400  border border-violet-500/20',
    canceled:    'bg-rose-500/10   text-rose-400   border border-rose-500/20',
};

const CASE_COLORS: Record<string, string> = {
    warranty_repair: 'text-indigo-400',
    exchange_return: 'text-amber-400',
    paid_service:    'text-emerald-400',
};

const CASE_LABELS: Record<string, string> = {
    warranty_repair: 'Warranty Repair',
    exchange_return: 'Exchange / Return',
    paid_service:    'Paid Service',
};

const STATUS_LABELS: Record<string, string> = {
    received:    'Received',
    in_progress: 'In Progress',
    resolved:    'Resolved',
    returned:    'Returned',
    canceled:    'Canceled',
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

function FormTextarea({ label, className = '', ...props }: { label: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div>
            <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <textarea className={`w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`} {...props} />
        </div>
    );
}

function SectionHeading({ icon, label }: { icon: string; label: string }) {
    return (
        <div className="border-b border-slate-800/80 pb-2">
            <h3 className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500">{icon} {label}</h3>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Maintenance({ maintenances, outlets, flash }: Props) {
    const { t } = useTranslation();
    const { isSuperadmin, outletId: userOutletId } = useAuth();

    const [tab, setTab]                     = useState<'new' | 'list'>('new');
    const [search, setSearch]               = useState('');
    const [statusFilter, setStatusFilter]   = useState<string>('all');
    const [editingCase, setEditingCase]     = useState<MaintenanceRecord | null>(null);
    const [newStatus, setNewStatus]         = useState<string>('');

    const form = useForm<{
        outlet_id:        number | '';
        product_name:     string;
        product_model:    string;
        customer_name:    string;
        customer_mobile:  string;
        customer_address: string;
        case_type:        string;
        problem:          string;
    }>({
        outlet_id:        isSuperadmin ? '' : (userOutletId ?? ''),
        product_name:     '',
        product_model:    '',
        customer_name:    '',
        customer_mobile:  '',
        customer_address: '',
        case_type:        'warranty_repair',
        problem:          '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(maintenancesRoute.store().url, {
            onSuccess: () => {
                form.reset();
                setTab('list');
            },
        });
    };

    const filtered = useMemo(() =>
        maintenances.filter(m => {
            const matchStatus = statusFilter === 'all' || m.status === statusFilter;
            const q = search.toLowerCase();
            const matchSearch = !q ||
                m.customer_name.toLowerCase().includes(q) ||
                m.customer_mobile.includes(q) ||
                m.product.name.toLowerCase().includes(q) ||
                m.product.brand.name.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        }),
    [maintenances, search, statusFilter]);

    const stats = useMemo(() => ({
        open:     maintenances.filter(m => m.status === 'received' || m.status === 'in_progress').length,
        resolved: maintenances.filter(m => m.status === 'resolved').length,
        returned: maintenances.filter(m => m.status === 'returned').length,
    }), [maintenances]);

    const handleStatusSave = () => {
        if (!editingCase) return;
        router.put(maintenancesRoute.update(editingCase.id).url, { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => setEditingCase(null),
        });
    };

    return (
        <PosShell activeNav="maintenance">
            <Head title={t('tabs.maintenance')} />

            <div className="space-y-4 p-4">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400">
                        {flash.success}
                    </div>
                )}

                {/* Tab toggle */}
                <div className="flex rounded-2xl border border-slate-800 bg-slate-900 p-1">
                    <button
                        onClick={() => setTab('new')}
                        className={`flex-1 rounded-xl py-2 text-[10px] font-bold transition-all ${tab === 'new' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        🔧 New Case
                    </button>
                    <button
                        onClick={() => setTab('list')}
                        className={`flex-1 rounded-xl py-2 text-[10px] font-bold transition-all ${tab === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        📋 Cases ({maintenances.length})
                    </button>
                </div>

                {tab === 'new' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Outlet (superadmin only) */}
                        {isSuperadmin && (
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                                <FormSelect
                                    label="Outlet *"
                                    value={form.data.outlet_id}
                                    onChange={e => form.setData('outlet_id', Number(e.target.value))}
                                    required
                                >
                                    <option value="">Select outlet...</option>
                                    {outlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                </FormSelect>
                                {form.errors.outlet_id && <p className="mt-1 text-[9px] text-rose-400">{form.errors.outlet_id}</p>}
                            </div>
                        )}

                        {/* Customer */}
                        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                            <SectionHeading icon="👤" label="Customer Info" />
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput
                                    label="Name *"
                                    placeholder="Customer name"
                                    value={form.data.customer_name}
                                    onChange={e => form.setData('customer_name', e.target.value)}
                                    required
                                />
                                <FormInput
                                    label="Mobile *"
                                    placeholder="98XXXXXXXX"
                                    type="tel"
                                    value={form.data.customer_mobile}
                                    onChange={e => form.setData('customer_mobile', e.target.value)}
                                    required
                                />
                            </div>
                            <FormInput
                                label="Address"
                                placeholder="e.g. Kathmandu, Bagmati"
                                value={form.data.customer_address}
                                onChange={e => form.setData('customer_address', e.target.value)}
                            />
                        </div>

                        {/* Product & Case */}
                        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                            <SectionHeading icon="📦" label="Product & Case" />

                            <div className="grid grid-cols-2 gap-3">
                                <FormInput
                                    label="Product Name *"
                                    placeholder="e.g. iPhone 15 Pro"
                                    value={form.data.product_name}
                                    onChange={e => form.setData('product_name', e.target.value)}
                                    required
                                />
                                <FormInput
                                    label="Model Number"
                                    placeholder="e.g. A3293"
                                    value={form.data.product_model}
                                    onChange={e => form.setData('product_model', e.target.value)}
                                />
                            </div>
                            {form.errors.product_name && <p className="mt-1 text-[9px] text-rose-400">{form.errors.product_name}</p>}

                            <div>
                                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500">Case Type *</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {CASE_TYPES.map(ct => (
                                        <button
                                            key={ct}
                                            type="button"
                                            onClick={() => form.setData('case_type', ct)}
                                            className={`rounded-xl py-2.5 text-[9px] font-bold leading-tight transition-all ${form.data.case_type === ct ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                        >
                                            {CASE_LABELS[ct]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <FormTextarea
                                label="Problem Description *"
                                placeholder="Describe the issue in detail..."
                                rows={4}
                                value={form.data.problem}
                                onChange={e => form.setData('problem', e.target.value)}
                                required
                            />
                            {form.errors.problem && <p className="mt-1 text-[9px] text-rose-400">{form.errors.problem}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
                        >
                            {form.processing ? 'Saving...' : '🔧 Create Case'}
                        </button>
                    </form>
                )}

                {tab === 'list' && (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setStatusFilter(statusFilter === 'received' ? 'all' : 'received')}
                                className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-center transition-all hover:border-blue-500/40"
                            >
                                <p className="text-lg font-black text-blue-400">{stats.open}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-blue-500/70">Open</p>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
                                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center transition-all hover:border-emerald-500/40"
                            >
                                <p className="text-lg font-black text-emerald-400">{stats.resolved}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-500/70">Resolved</p>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === 'returned' ? 'all' : 'returned')}
                                className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-center transition-all hover:border-violet-500/40"
                            >
                                <p className="text-lg font-black text-violet-400">{stats.returned}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-violet-500/70">Returned</p>
                            </button>
                        </div>

                        <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">◆ Cases</h3>
                                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[9px] font-bold text-slate-500">{filtered.length}</span>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-slate-500">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search customer, product..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Status filter pills */}
                            <div className="flex space-x-1.5 overflow-x-auto pb-1">
                                {(['all', ...STATUS_LIST] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-bold transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        {s === 'all' ? 'All' : STATUS_LABELS[s]}
                                    </button>
                                ))}
                            </div>

                            {/* Rows */}
                            <div className="space-y-2">
                                {filtered.length === 0 ? (
                                    <p className="py-6 text-center text-xs text-slate-600">No cases found.</p>
                                ) : filtered.map(m => (
                                    <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[11px] font-bold text-slate-200">{m.customer_name}</p>
                                                <p className="text-[9px] text-slate-500">
                                                    {m.customer_mobile}{m.customer_address ? ` • ${m.customer_address}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide ${STATUS_COLORS[m.status]}`}>
                                                    {STATUS_LABELS[m.status]}
                                                </span>
                                                <span className={`text-[9px] font-bold ${CASE_COLORS[m.case_type]}`}>
                                                    {CASE_LABELS[m.case_type]}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-800/60 pt-2">
                                            <p className="text-[10px] font-bold text-slate-300">
                                                {m.product_name}
                                                {m.product_model ? ` (${m.product_model})` : ''}
                                            </p>
                                            <p className="text-[9px] text-slate-500">{m.outlet.code} • #{m.id}</p>
                                        </div>

                                        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
                                            <p className="text-[10px] text-slate-400 line-clamp-2">{m.problem}</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => { setEditingCase(m); setNewStatus(m.status); }}
                                                className="flex items-center gap-1 rounded-xl bg-slate-800 px-2.5 py-1.5 text-[9px] font-bold text-slate-400 hover:text-indigo-400 transition-all"
                                            >
                                                <Pencil className="h-3 w-3" /> Update Status
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Status update modal */}
            {editingCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="w-full max-w-sm space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-indigo-400">Update Status</h3>
                            <button onClick={() => setEditingCase(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                            <p className="text-[11px] font-bold text-slate-200">{editingCase.customer_name}</p>
                            <p className="text-[9px] text-slate-500">
                                {editingCase.product_name}{editingCase.product_model ? ` (${editingCase.product_model})` : ''} • {editingCase.outlet.code}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                            {STATUS_LIST.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setNewStatus(s)}
                                    className={`rounded-xl py-2.5 text-[11px] font-bold transition-all ${newStatus === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleStatusSave}
                            className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700"
                        >
                            Save Status
                        </button>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
