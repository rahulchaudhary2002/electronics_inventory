import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
    children: ReactNode;
};

export default function PosLayout({ children }: Props) {
    useTranslation(); // re-render children on language change
    return (
        <div className="flex h-screen overflow-hidden items-stretch justify-center bg-slate-950 text-slate-100 antialiased">
            <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-x border-slate-900 bg-slate-950 shadow-2xl">
                {children}
            </div>
        </div>
    );
}
