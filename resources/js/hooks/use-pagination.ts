import { useMemo, useState } from 'react';

export function usePagination<T>(items: T[], perPage = 15) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / perPage));

    // Reset to page 1 whenever the items list changes (filter/search applied)
    const safePage = Math.min(page, totalPages);

    const paged = useMemo(
        () => items.slice((safePage - 1) * perPage, safePage * perPage),
        [items, safePage, perPage],
    );

    const goTo   = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
    const reset  = ()          => setPage(1);

    return { paged, page: safePage, totalPages, total: items.length, goTo, reset };
}
