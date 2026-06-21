import { type ReactNode } from 'react';
import LanguageSwitcher from '@/components/language-switcher';

type Props = {
    title: string;
    description?: string;
    children: ReactNode;
};

export default function AuthCard({ title, description, children }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100 antialiased">
            <div className="pointer-events-none absolute left-10 top-10 h-44 w-44 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 right-10 h-44 w-44 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-sm">
                <div className="mb-4 flex justify-end">
                    <LanguageSwitcher />
                </div>

                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white">
                            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.818a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.845-.143z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-white">{title}</h1>
                    {description && (
                        <p className="mt-1.5 text-xs text-slate-400">{description}</p>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
