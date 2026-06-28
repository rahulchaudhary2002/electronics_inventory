import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    page: number;
    totalPages: number;
    total: number;
    perPage: number;
    onPage: (p: number) => void;
};

export default function Pagination({ page, totalPages, total, perPage, onPage }: Props) {
    if (totalPages <= 1) return null;

    const from = (page - 1) * perPage + 1;
    const to   = Math.min(page * perPage, total);

    // Build page numbers: always show first, last, current ±1, with ellipses
    const pages: (number | '...')[] = [];
    const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };

    add(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) pages.push('...');
    if (totalPages > 1) add(totalPages);

    return (
        <div className="flex items-center justify-between gap-3 pt-3">
            <p className="text-[11px] text-slate-500 tabular-nums">
                {from}–{to} of {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPage(page - 1)}
                    disabled={page === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-600">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPage(p)}
                            className={`flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-1.5 text-xs font-semibold transition-colors ${
                                p === page
                                    ? 'border-indigo-500 bg-indigo-600 text-white'
                                    : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPage(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
