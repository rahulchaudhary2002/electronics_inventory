import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
    children: ReactNode;
};

export default function PosLayout({ children }: Props) {
    useTranslation(); // re-render children on language change
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
            {children}
        </div>
    );
}
