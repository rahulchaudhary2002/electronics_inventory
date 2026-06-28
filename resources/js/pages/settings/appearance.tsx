import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import SettingsShell from '@/components/settings-shell';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';

type ThemeOption = {
    value: Appearance;
    icon: React.ElementType;
    label: string;
    description: string;
    preview: { bg: string; card: string; text: string; accent: string };
};

export default function AppearancePage() {
    const { t } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    const options: ThemeOption[] = [
        {
            value: 'light',
            icon: Sun,
            label: t('settings.appearanceLight'),
            description: t('settings.appearanceLightDesc'),
            preview: { bg: '#f8fafc', card: '#f1f5f9', text: '#0f172a', accent: '#4f46e5' },
        },
        {
            value: 'dark',
            icon: Moon,
            label: t('settings.appearanceDark'),
            description: t('settings.appearanceDarkDesc'),
            preview: { bg: '#020617', card: '#0f172a', text: '#f8fafc', accent: '#6366f1' },
        },
        {
            value: 'system',
            icon: Monitor,
            label: t('settings.appearanceSystem'),
            description: t('settings.appearanceSystemDesc'),
            preview: { bg: 'linear-gradient(135deg, #f8fafc 50%, #020617 50%)', card: '#6366f1', text: '#6366f1', accent: '#6366f1' },
        },
    ];

    return (
        <SettingsShell>
            <Head title={t('settings.appearance')} />

            <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                        <Palette className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{t('settings.appearanceTitle')}</h3>
                        <p className="text-xs text-slate-500">{t('settings.appearanceSubtitle')}</p>
                    </div>
                </div>

                {/* Theme cards */}
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
                    {options.map(({ value, icon: Icon, label, description, preview }) => {
                        const active = appearance === value;
                        return (
                            <button
                                key={value}
                                onClick={() => updateAppearance(value)}
                                className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
                                    active
                                        ? 'border-indigo-500/60 ring-2 ring-indigo-500/20'
                                        : 'border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                {/* Mini preview */}
                                <div
                                    className="relative h-24 w-full overflow-hidden"
                                    style={{ background: preview.bg }}
                                >
                                    {value === 'system' ? (
                                        <>
                                            {/* Split preview for system */}
                                            <div className="absolute inset-0 flex">
                                                <div className="flex-1 bg-[#f8fafc] p-2">
                                                    <div className="mb-1.5 h-2 w-10 rounded-full bg-[#cbd5e1]" />
                                                    <div className="h-6 w-full rounded-lg bg-[#e2e8f0]" />
                                                    <div className="mt-1.5 h-2 w-8 rounded-full bg-[#94a3b8]" />
                                                </div>
                                                <div className="flex-1 bg-[#020617] p-2">
                                                    <div className="mb-1.5 h-2 w-10 rounded-full bg-[#334155]" />
                                                    <div className="h-6 w-full rounded-lg bg-[#0f172a]" />
                                                    <div className="mt-1.5 h-2 w-8 rounded-full bg-[#475569]" />
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-full bg-indigo-600 p-1.5 shadow-lg">
                                                    <Monitor className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-3" style={{ background: preview.bg }}>
                                            <div className="mb-2 h-2 w-12 rounded-full" style={{ background: preview.text + '40' }} />
                                            <div className="mb-1.5 h-8 w-full rounded-xl" style={{ background: preview.card }} />
                                            <div className="flex gap-1.5">
                                                <div className="h-2 w-8 rounded-full" style={{ background: preview.accent }} />
                                                <div className="h-2 w-6 rounded-full" style={{ background: preview.text + '30' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Label row */}
                                <div className="flex items-center gap-2.5 border-t border-slate-800 bg-slate-900/80 px-3.5 py-3">
                                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                                        active ? 'bg-indigo-600' : 'bg-slate-800 group-hover:bg-slate-700'
                                    }`}>
                                        {active
                                            ? <Check className="h-3.5 w-3.5 text-white" />
                                            : <Icon className="h-3.5 w-3.5 text-slate-400" />
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold ${active ? 'text-indigo-400' : 'text-white'}`}>{label}</p>
                                        <p className="truncate text-[10px] text-slate-500">{description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </SettingsShell>
    );
}
