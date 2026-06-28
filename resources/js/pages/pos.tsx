import { Head, useForm } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CreditCard, Store, User, Package, ClipboardCheck, X, Image } from 'lucide-react';
import PosShell from '@/components/pos-shell';
import { useAuth } from '@/hooks/use-auth';
import * as ordersRoute from '@/routes/orders';

// ─── Types ───────────────────────────────────────────────────────────────────

type Outlet  = { id: number; name: string; code: string };
type Brand   = { id: number; name: string };
type Product = { id: number; name: string; model_number: string | null; brand: Brand };
type StockRow = { id: number; outlet_id: number; product_id: number; quantity: string; product: Product };

type Props = {
    outlets: Outlet[];
    stocks: StockRow[];
    flash?: { success?: string };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_TYPES = ['cash', 'cheque', 'online', 'credit', 'installment'] as const;
const STATUS_LIST   = ['pending', 'confirm', 'dispatched', 'delivered', 'canceled'] as const;
const EMI_MONTHS    = [3, 6, 9, 12, 18, 24, 36];

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

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <h3 className="font-bold text-white">{label}</h3>
        </div>
    );
}

function InfoRow({ label, value, color = 'text-slate-300' }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>{value}</span>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Pos({ outlets, stocks, flash }: Props) {
    const { t } = useTranslation();
    const { isSuperadmin, outletId: userOutletId } = useAuth();

    const defaultOutletId = isSuperadmin ? '' : (userOutletId ?? '');
    const [destOutletId, setDestOutletId] = useState<number | ''>(defaultOutletId);
    const [warrantyPreview, setWarrantyPreview] = useState<string | null>(null);
    const warrantyRef = useRef<HTMLInputElement>(null);

    // Product list comes from destination outlet stock
    const outletStocks = useMemo(() => {
        if (!destOutletId) return [];
        return stocks.filter(s => s.outlet_id === destOutletId);
    }, [stocks, destOutletId]);

    const form = useForm<{
        origin_outlet_id:      number | '';
        destination_outlet_id: number | '';
        product_id:            number | '';
        customer_name:         string;
        customer_mobile:       string;
        customer_address:      string;
        price:                 string;
        quantity:              string;
        payment_type:          string;
        status:                string;
        warranty_card:         File | null;
        advance_amount:        string;
        due_date:              string;
        down_payment:          string;
        installment_months:    number | '';
    }>({
        origin_outlet_id:      defaultOutletId,
        destination_outlet_id: defaultOutletId,
        product_id:            '',
        customer_name:         '',
        customer_mobile:       '',
        customer_address:      '',
        price:                 '',
        quantity:              '1',
        payment_type:          'cash',
        status:                'pending',
        warranty_card:         null,
        advance_amount:        '',
        due_date:              '',
        down_payment:          '',
        installment_months:    '',
    });

    // Live EMI calculations
    const price         = parseFloat(form.data.price) || 0;
    const downPayment   = parseFloat(form.data.down_payment) || 0;
    const advanceAmount = parseFloat(form.data.advance_amount) || 0;
    const emiMonths     = Number(form.data.installment_months) || 0;
    const loanAmount    = form.data.payment_type === 'installment'
        ? Math.max(0, price - downPayment)
        : Math.max(0, price - advanceAmount);
    const monthlyEmi    = emiMonths > 0 ? loanAmount / emiMonths : 0;

    const fmt = (n: number) =>
        `रू ${n.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleWarrantyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        form.setData('warranty_card', file as any);
        setWarrantyPreview(file ? URL.createObjectURL(file) : null);
    };

    const clearWarranty = () => {
        form.setData('warranty_card', null as any);
        setWarrantyPreview(null);
        if (warrantyRef.current) warrantyRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(ordersRoute.store().url, {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setDestOutletId(defaultOutletId);
                setWarrantyPreview(null);
                if (warrantyRef.current) warrantyRef.current.value = '';
            },
        });
    };

    return (
        <PosShell activeNav="pos">
            <Head title={t('tabs.pos')} />

            <div className="space-y-6 px-4 py-5 md:px-6">
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Origin & Destination Outlets */}
                    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <SectionHeading icon={Store} label="Outlets" />
                        <div className="grid grid-cols-2 gap-3">
                            {/* Origin — read-only for outlet users */}
                            <div>
                                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Origin *</label>
                                {isSuperadmin ? (
                                    <select
                                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.data.origin_outlet_id}
                                        onChange={e => form.setData('origin_outlet_id', Number(e.target.value))}
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {outlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                    </select>
                                ) : (
                                    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-400">
                                        {outlets.find(o => o.id === userOutletId)?.name ?? '—'}
                                    </div>
                                )}
                            </div>

                            {/* Destination — selectable, drives stock filter */}
                            <div>
                                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination *</label>
                                <select
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                                    value={form.data.destination_outlet_id}
                                    onChange={e => {
                                        const id = Number(e.target.value);
                                        form.setData('destination_outlet_id', id);
                                        form.setData('product_id', '');
                                        setDestOutletId(id);
                                    }}
                                    required
                                >
                                    {!isSuperadmin && outlets.length === 0
                                        ? <option value={userOutletId ?? ''}>{outlets.find(o => o.id === userOutletId)?.name ?? 'My Outlet'}</option>
                                        : <>
                                            <option value="">Select...</option>
                                            {outlets.map(o => <option key={o.id} value={o.id}>{o.name} ({o.code})</option>)}
                                        </>
                                    }
                                </select>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-600">Stock will be deducted from the destination outlet</p>
                    </div>

                    {/* Customer */}
                    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <SectionHeading icon={User} label={t('orderMgmt.customer')} />
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput
                                label={t('orderMgmt.customerName') + ' *'}
                                placeholder="Full name"
                                value={form.data.customer_name}
                                onChange={e => form.setData('customer_name', e.target.value)}
                                required
                            />
                            <FormInput
                                label={t('orderMgmt.mobile') + ' *'}
                                placeholder="98XXXXXXXX"
                                type="tel"
                                value={form.data.customer_mobile}
                                onChange={e => form.setData('customer_mobile', e.target.value)}
                                required
                            />
                        </div>
                        <FormInput
                            label={t('orderMgmt.address')}
                            placeholder="e.g. Kathmandu, Bagmati"
                            value={form.data.customer_address}
                            onChange={e => form.setData('customer_address', e.target.value)}
                        />
                    </div>

                    {/* Product & Price */}
                    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <SectionHeading icon={Package} label={t('orderMgmt.product')} />
                        <FormSelect
                            label={t('orderMgmt.product') + ' *'}
                            value={form.data.product_id}
                            onChange={e => form.setData('product_id', Number(e.target.value))}
                            disabled={!destOutletId}
                            required
                        >
                            <option value="">
                                {!destOutletId
                                    ? 'Select outlet first...'
                                    : outletStocks.length === 0
                                        ? t('orderMgmt.noProductsInStock')
                                        : 'Select product...'}
                            </option>
                            {outletStocks.map(s => (
                                <option key={s.product_id} value={s.product_id}>
                                    {`${s.product.brand.name} ${s.product.name}${s.product.model_number ? ` (${s.product.model_number})` : ''} - Qty: ${Number(s.quantity).toLocaleString()}`}
                                </option>
                            ))}
                        </FormSelect>
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput
                                label={t('orderMgmt.price') + ' *'}
                                type="number" min={0} step="0.01" placeholder="0.00"
                                value={form.data.price}
                                onChange={e => form.setData('price', e.target.value)}
                                required
                            />
                            <FormInput
                                label="Quantity *"
                                type="number" min={0.01} step="0.01" placeholder="1"
                                value={form.data.quantity}
                                onChange={e => form.setData('quantity', e.target.value)}
                                required
                            />
                        </div>
                        {form.errors.quantity && (
                            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[10px] text-rose-400">
                                {form.errors.quantity}
                            </p>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <SectionHeading icon={CreditCard} label={t('orderMgmt.paymentType')} />

                        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                            {PAYMENT_TYPES.map(pt => (
                                <button
                                    key={pt}
                                    type="button"
                                    onClick={() => form.setData('payment_type', pt)}
                                    className={`rounded-xl py-2 text-[10px] font-bold transition-all ${form.data.payment_type === pt ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {t(`orderMgmt.${pt}`)}
                                </button>
                            ))}
                        </div>

                        {/* Credit fields */}
                        {form.data.payment_type === 'credit' && (
                            <div className="space-y-3 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Credit / Due Details</p>
                                <FormInput
                                    label={t('orderMgmt.advanceAmount')}
                                    type="number" min={0} step="0.01" placeholder="0.00"
                                    value={form.data.advance_amount}
                                    onChange={e => form.setData('advance_amount', e.target.value)}
                                />
                                <InfoRow label={t('orderMgmt.remainingAmount')} value={fmt(loanAmount)} color="text-amber-400" />
                                <FormInput
                                    label={t('orderMgmt.dueDate')}
                                    type="date"
                                    value={form.data.due_date}
                                    onChange={e => form.setData('due_date', e.target.value)}
                                />
                            </div>
                        )}

                        {/* EMI calculator */}
                        {form.data.payment_type === 'installment' && (
                            <div className="space-y-3 rounded-2xl border border-orange-500/15 bg-orange-500/5 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">⚡ {t('orderMgmt.emiCalculator')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <FormInput
                                        label={t('orderMgmt.downPayment')}
                                        type="number" min={0} step="0.01" placeholder="0.00"
                                        value={form.data.down_payment}
                                        onChange={e => form.setData('down_payment', e.target.value)}
                                    />
                                    <FormSelect
                                        label={t('orderMgmt.months')}
                                        value={form.data.installment_months}
                                        onChange={e => form.setData('installment_months', Number(e.target.value) as any)}
                                    >
                                        <option value="">- months</option>
                                        {EMI_MONTHS.map(m => <option key={m} value={m}>{m} months</option>)}
                                    </FormSelect>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                                    <InfoRow label={t('orderMgmt.loanAmount')} value={fmt(loanAmount)} />
                                    <InfoRow
                                        label={t('orderMgmt.monthlyEmi')}
                                        value={emiMonths > 0 ? fmt(monthlyEmi) : '-'}
                                        color="text-orange-400"
                                    />
                                    <div className="border-t border-slate-800 pt-2">
                                        <InfoRow
                                            label={t('orderMgmt.totalPayable')}
                                            value={emiMonths > 0 ? fmt(downPayment + monthlyEmi * emiMonths) : fmt(price)}
                                            color="text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status & Warranty */}
                    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <SectionHeading icon={ClipboardCheck} label={t('orderMgmt.statusLabel')} />

                        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                            {STATUS_LIST.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => form.setData('status', s)}
                                    className={`rounded-xl py-2 text-[10px] font-bold transition-all ${form.data.status === s ? 'bg-indigo-600 text-white' : 'border border-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {t(`orderMgmt.${s}`)}
                                </button>
                            ))}
                        </div>

                        {/* Warranty card upload */}
                        <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('orderMgmt.warrantyCard')}</label>
                            {warrantyPreview ? (
                                <div className="relative">
                                    <img src={warrantyPreview} alt="Warranty" className="h-28 w-full rounded-xl object-cover border border-slate-800" />
                                    <button type="button" onClick={clearWarranty} className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-1 text-slate-400 hover:text-rose-400">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => warrantyRef.current?.click()}
                                    className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 bg-slate-950 text-slate-500 transition-all hover:border-indigo-500/50 hover:text-indigo-400"
                                >
                                    <Image className="h-5 w-5" />
                                    <span className="text-[10px] font-bold">{t('orderMgmt.uploadPhoto')}</span>
                                </div>
                            )}
                            <input ref={warrantyRef} type="file" accept="image/*" className="hidden" onChange={handleWarrantyFile} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
                    >
                        <ClipboardCheck className="h-4 w-4" />
                        {form.processing ? t('orderMgmt.creating') : t('orderMgmt.createBtn')}
                    </button>
                </form>
            </div>
        </PosShell>
    );
}
