import { Head, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Pencil, Search, Wrench, User, Package, X } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import Pagination from '@/components/pagination';
import { usePagination } from '@/hooks/use-pagination';
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

const CASE_LABEL_KEYS: Record<string, string> = {
    warranty_repair: 'maintenance.warrantyRepairLabel',
    exchange_return: 'maintenance.exchangeReturnLabel',
    paid_service:    'maintenance.paidServiceLabel',
};

const STATUS_LABEL_KEYS: Record<string, string> = {
    received:    'maintenance.received',
    in_progress: 'maintenance.inProgress',
    resolved:    'maintenance.resolved',
    returned:    'maintenance.returned',
    canceled:    'maintenance.canceled',
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const fieldCls = 'w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50';

function FormInput({ label, className = '', ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <input className={`${fieldCls} ${className}`} {...props} />
        </div>
    );
}

function FormSelect({ label, children, className = '', ...props }: { label: string; children: React.ReactNode; className?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <select className={`${fieldCls} ${className}`} {...props}>
                {children}
            </select>
        </div>
    );
}

function FormTextarea({ label, className = '', ...props }: { label: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <textarea className={`${fieldCls} min-h-[100px] resize-y ${className}`} {...props} />
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
                m.product_name.toLowerCase().includes(q) ||
                (m.product_model ?? '').toLowerCase().includes(q);
            return matchStatus && matchSearch;
        }),
    [maintenances, search, statusFilter]);
    const { paged, page, totalPages, total, goTo } = usePagination(filtered, 15);

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

            <div className="space-y-6 px-4 py-5 md:px-6">
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Tab toggle */}
                <div className="flex rounded-2xl border border-slate-800 bg-slate-900 p-1">
                    <button
                        onClick={() => setTab('new')}
                        className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${tab === 'new' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        New Case
                    </button>
                    <button
                        onClick={() => setTab('list')}
                        className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${tab === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        All Cases ({maintenances.length})
                    </button>
                </div>

                {tab === 'new' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Outlet (superadmin only) */}
                        {isSuperadmin && (
                            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                                <FormSelect
                                    {...{label: t('maintenance.outletLabel')}}
                                    value={form.data.outlet_id}
                                    onChange={e => form.setData('outlet_id', Number(e.target.value))}
                                    required
                                >
                                    <option value="">{t('maintenance.selectOutlet')}</option>
                                    {outlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                </FormSelect>
                                {form.errors.outlet_id && <p className="mt-1.5 text-[10px] text-rose-400">{form.errors.outlet_id}</p>}
                            </div>
                        )}

                        {/* Customer */}
                        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                                    <User className="h-4 w-4 text-indigo-400" />
                                </div>
                                <h3 className="font-bold text-white">{t('maintenance.customerInfo')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput
                                    {...{label: t('maintenance.customerNameLabel')}}
                                    placeholder={t('maintenance.customerName')}
                                    value={form.data.customer_name}
                                    onChange={e => form.setData('customer_name', e.target.value)}
                                    required
                                />
                                <FormInput
                                    {...{label: t('maintenance.mobileLabel')}}
                                    placeholder={t('maintenance.mobilePlaceholder')}
                                    type="tel"
                                    value={form.data.customer_mobile}
                                    onChange={e => form.setData('customer_mobile', e.target.value)}
                                    required
                                />
                            </div>
                            <FormInput
                                {...{label: t('maintenance.addressLabel')}}
                                placeholder="e.g. Kathmandu, Bagmati"
                                value={form.data.customer_address}
                                onChange={e => form.setData('customer_address', e.target.value)}
                            />
                        </div>

                        {/* Product & Case */}
                        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                                    <Package className="h-4 w-4 text-amber-400" />
                                </div>
                                <h3 className="font-bold text-white">{t('maintenance.productAndCase')}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormInput
                                    {...{label: t('maintenance.productNameLabel')}}
                                    placeholder="e.g. iPhone 15 Pro"
                                    value={form.data.product_name}
                                    onChange={e => form.setData('product_name', e.target.value)}
                                    required
                                />
                                <FormInput
                                    {...{label: t('maintenance.modelLabel')}}
                                    placeholder="e.g. A3293"
                                    value={form.data.product_model}
                                    onChange={e => form.setData('product_model', e.target.value)}
                                />
                            </div>
                            {form.errors.product_name && <p className="mt-1 text-[10px] text-rose-400">{form.errors.product_name}</p>}

                            <div>
                                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Case Type *</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {CASE_TYPES.map(ct => (
                                        <button
                                            key={ct}
                                            type="button"
                                            onClick={() => form.setData('case_type', ct)}
                                            className={`rounded-xl py-2.5 text-[10px] font-semibold leading-tight transition-all ${form.data.case_type === ct ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                        >
                                            {t(CASE_LABEL_KEYS[ct])}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <FormTextarea
                                {...{label: t('maintenance.problemLabel')}}
                                placeholder={t('maintenance.problemPlaceholder')}
                                rows={4}
                                value={form.data.problem}
                                onChange={e => form.setData('problem', e.target.value)}
                                required
                            />
                            {form.errors.problem && <p className="mt-1 text-[10px] text-rose-400">{form.errors.problem}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
                        >
                            <Wrench className="h-4 w-4" />
                            {form.processing ? 'Saving...' : 'Create Case'}
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
                                <p className="text-[10px] font-semibold uppercase text-blue-500/70">Open</p>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
                                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center transition-all hover:border-emerald-500/40"
                            >
                                <p className="text-lg font-black text-emerald-400">{stats.resolved}</p>
                                <p className="text-[10px] font-semibold uppercase text-emerald-500/70">Resolved</p>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === 'returned' ? 'all' : 'returned')}
                                className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-center transition-all hover:border-violet-500/40"
                            >
                                <p className="text-lg font-black text-violet-400">{stats.returned}</p>
                                <p className="text-[10px] font-semibold uppercase text-violet-500/70">Returned</p>
                            </button>
                        </div>

                        <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                                <h3 className="text-sm font-bold text-white">All Cases</h3>
                                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">{total}</span>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <Search className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    placeholder={t('maintenance.searchPlaceholder')}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-300 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            {/* Status filter pills */}
                            <div className="flex space-x-1.5 overflow-x-auto pb-1">
                                {(['all', ...STATUS_LIST] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        {s === 'all' ? t('common.all') : t(STATUS_LABEL_KEYS[s])}
                                    </button>
                                ))}
                            </div>

                            {/* Rows */}
                            <div className="space-y-2">
                                {total === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800">
                                            <Wrench className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500">{t('maintenance.noCasesFound')}</p>
                                    </div>
                                ) : paged.map(m => (
                                    <div key={m.id} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-slate-700">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-white">{m.customer_name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {m.customer_mobile}{m.customer_address ? ` • ${m.customer_address}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[m.status]}`}>
                                                    {t(STATUS_LABEL_KEYS[m.status])}
                                                </span>
                                                <span className={`text-[10px] font-semibold ${CASE_COLORS[m.case_type]}`}>
                                                    {t(CASE_LABEL_KEYS[m.case_type])}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-800/60 pt-2">
                                            <p className="text-xs font-semibold text-slate-200">
                                                {m.product_name}
                                                {m.product_model ? ` (${m.product_model})` : ''}
                                            </p>
                                            <p className="text-xs text-slate-500">{m.outlet.code} • #{m.id}</p>
                                        </div>

                                        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
                                            <p className="text-xs text-slate-400 line-clamp-2">{m.problem}</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => { setEditingCase(m); setNewStatus(m.status); }}
                                                className="flex items-center gap-1 rounded-xl bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-all"
                                            >
                                                <Pencil className="h-3 w-3" /> Update Status
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination page={page} totalPages={totalPages} total={total} perPage={15} onPage={goTo} />
                        </div>
                    </div>
                )}
            </div>

            {/* Status update modal */}
            {editingCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                                    <Pencil className="h-4 w-4 text-indigo-400" />
                                </div>
                                <h2 className="font-black text-white">{t('maintenance.updateStatus')}</h2>
                            </div>
                            <button onClick={() => setEditingCase(null)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-800 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="font-semibold text-white">{editingCase.customer_name}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {editingCase.product_name}{editingCase.product_model ? ` (${editingCase.product_model})` : ''} • {editingCase.outlet.code}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5">
                                {STATUS_LIST.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setNewStatus(s)}
                                        className={`rounded-2xl py-2.5 text-xs font-semibold transition-all ${newStatus === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'}`}
                                    >
                                        {t(STATUS_LABEL_KEYS[s])}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-800 px-6 py-4">
                            <button
                                onClick={handleStatusSave}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
                            >
                                Save Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PosShell>
    );
}
