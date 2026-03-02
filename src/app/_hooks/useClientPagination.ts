import { useEffect, useMemo, useState } from 'react';

type UseClientPaginationOptions<T> = {
  items: T[];
  pageSize: number;
};

export function useClientPagination<T>({
  items,
  pageSize,
}: Readonly<UseClientPaginationOptions<T>>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return items.slice(from, to);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    totalPages,
    paginatedItems,
  };
}
