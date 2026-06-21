import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react';
import PosShell from '@/components/pos-shell';

export default function Dispatch() {
    const { t } = useTranslation();

    return (
        <PosShell activeNav="dispatch">
            <Head title={t('tabs.dispatch')} />

            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500/10 text-orange-400">
                    <Truck className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-white">{t('tabs.dispatch')}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t('common.comingSoon')}</p>
                </div>
            </div>
        </PosShell>
    );
}
