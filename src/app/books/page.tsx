'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Box } from 'tharaday';

import { PaginatedTableSection } from '@/app/_components/PaginatedTableSection';
import { useClientPagination } from '@/app/_hooks/useClientPagination';
import { BooksFilters } from '@/app/books/_components/BooksFilters';
import { BooksTable } from '@/app/books/_components/BooksTable';
import { Book } from '@/app/books/types';
import { apiRequest } from '@/lib/api-client';

const BOOKS_PAGE_SIZE = 10;
const ALL_FILTER = 'all';
const NONE_FILTER = 'none';

async function loadBooks() {
  return apiRequest<Book[]>('/books');
}

export default function BooksPage() {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);

  const booksQuery = useQuery({
    queryKey: ['books'],
    queryFn: loadBooks,
  });

  const books = booksQuery.data || [];
  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return books.filter((book) => {
      const statusMatches =
        statusFilter === ALL_FILTER
          ? true
          : statusFilter === NONE_FILTER
            ? book.status === null
            : (book.status || '').toLowerCase() === statusFilter;

      const authorName = [book.author_first_name, book.author_last_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const searchMatches =
        normalizedSearch.length === 0
          ? true
          : `${book.title} ${authorName}`
              .toLowerCase()
              .includes(normalizedSearch);

      return statusMatches && searchMatches;
    });
  }, [books, searchValue, statusFilter]);

  const statusOptions = useMemo(() => {
    const statusValues = Array.from(
      new Set(
        books
          .map((book) => book.status)
          .filter(
            (value): value is string =>
              typeof value === 'string' && value.length > 0,
          ),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: ALL_FILTER, label: 'All statuses' },
      { value: NONE_FILTER, label: 'No status' },
      ...statusValues.map((value) => ({
        value: value.toLowerCase(),
        label: value,
      })),
    ];
  }, [books]);

  const { page, setPage, totalPages, paginatedItems } = useClientPagination({
    items: filteredBooks,
    pageSize: BOOKS_PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [searchValue, setPage, statusFilter]);

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <BooksFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
      />

      <PaginatedTableSection
        title="Books"
        itemLabel="books"
        isLoading={booksQuery.isLoading}
        isError={booksQuery.isError}
        errorMessage={(booksQuery.error as Error | null)?.message}
        showingCount={paginatedItems.length}
        totalCount={filteredBooks.length}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
      >
        <BooksTable books={paginatedItems} />
      </PaginatedTableSection>
    </Box>
  );
}
