'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Text } from 'tharaday';

import { ConfirmActionModal } from '@/app/_components/ConfirmActionModal';
import { PaginatedTableSection } from '@/app/_components/PaginatedTableSection';
import { useClientPagination } from '@/app/_hooks/useClientPagination';
import { BookFormModal } from '@/app/books/_components/BookFormModal';
import { BooksFilters } from '@/app/books/_components/BooksFilters';
import { BooksTable } from '@/app/books/_components/BooksTable';
import { Book } from '@/app/books/types';
import { apiRequest } from '@/lib/api-client';

const BOOKS_PAGE_SIZE = 10;
const ALL_FILTER = 'all';
const NONE_FILTER = 'none';

type BookFormPayload = {
  title: string;
  description: string | null;
  tag_id: number;
  status_id: number;
  author_id: number;
  publisher_id: number;
  pages: number | null;
};

type LookupItem = {
  id: number;
  name: string;
};

type AuthorItem = {
  id: number;
  first_name: string | null;
  last_name: string | null;
};

type PublisherItem = {
  id: number;
  name: string | null;
};

async function loadBooks() {
  return apiRequest<Book[]>('/books');
}

export default function BooksPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const booksQuery = useQuery({
    queryKey: ['books'],
    queryFn: loadBooks,
  });
  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiRequest<LookupItem[]>('/tags'),
  });
  const statusesQuery = useQuery({
    queryKey: ['statuses'],
    queryFn: () => apiRequest<LookupItem[]>('/statuses'),
  });
  const authorsQuery = useQuery({
    queryKey: ['authors'],
    queryFn: () => apiRequest<AuthorItem[]>('/authors'),
  });
  const publishersQuery = useQuery({
    queryKey: ['publishers'],
    queryFn: () => apiRequest<PublisherItem[]>('/publishers'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: BookFormPayload) =>
      apiRequest<Book>('/books', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: async () => {
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      bookId,
      payload,
    }: {
      bookId: number;
      payload: BookFormPayload;
    }) =>
      apiRequest<Book>('/books', {
        method: 'PATCH',
        body: {
          id: bookId,
          ...payload,
        },
      }),
    onSuccess: async () => {
      setEditingBook(null);
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId: number) =>
      apiRequest<null>(`/books?id=${bookId}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      setDeletingBook(null);
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
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
    const statuses = statusesQuery.data || [];

    return [
      { value: ALL_FILTER, label: 'All statuses' },
      { value: NONE_FILTER, label: 'No status' },
      ...statuses.map((status) => ({
        value: status.name.toLowerCase(),
        label: status.name,
      })),
    ];
  }, [statusesQuery.data]);

  const tagModalOptions = useMemo(() => {
    return (tagsQuery.data || []).map((tag) => ({
      value: String(tag.id),
      label: tag.name,
    }));
  }, [tagsQuery.data]);

  const statusModalOptions = useMemo(() => {
    return (statusesQuery.data || []).map((status) => ({
      value: String(status.id),
      label: status.name,
    }));
  }, [statusesQuery.data]);

  const authorModalOptions = useMemo(() => {
    return (authorsQuery.data || []).map((author) => {
      const label =
        `${author.first_name || ''} ${author.last_name || ''}`.trim();
      return {
        value: String(author.id),
        label: label || `Author #${author.id}`,
      };
    });
  }, [authorsQuery.data]);

  const publisherModalOptions = useMemo(() => {
    return (publishersQuery.data || []).map((publisher) => ({
      value: String(publisher.id),
      label: publisher.name || `Publisher #${publisher.id}`,
    }));
  }, [publishersQuery.data]);

  const { page, setPage, totalPages, paginatedItems } = useClientPagination({
    items: filteredBooks,
    pageSize: BOOKS_PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [searchValue, setPage, statusFilter]);

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={4}
      >
        <Text variant="h3" weight="bold">
          Books
        </Text>
        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
          Add book
        </Button>
      </Box>

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
        <BooksTable
          books={paginatedItems}
          onEdit={(book) => setEditingBook(book)}
          onDelete={(book) => setDeletingBook(book)}
        />
      </PaginatedTableSection>

      <BookFormModal
        isOpen={isCreateOpen}
        mode="create"
        isPending={createMutation.isPending}
        errorMessage={(createMutation.error as Error | null)?.message}
        tagOptions={tagModalOptions}
        statusOptions={statusModalOptions}
        authorOptions={authorModalOptions}
        publisherOptions={publisherModalOptions}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />

      <BookFormModal
        isOpen={Boolean(editingBook)}
        mode="edit"
        book={editingBook}
        isPending={editMutation.isPending}
        errorMessage={(editMutation.error as Error | null)?.message}
        tagOptions={tagModalOptions}
        statusOptions={statusModalOptions}
        authorOptions={authorModalOptions}
        publisherOptions={publisherModalOptions}
        onClose={() => setEditingBook(null)}
        onSubmit={(payload) => {
          if (!editingBook) {
            return;
          }
          editMutation.mutate({ bookId: editingBook.id, payload });
        }}
      />

      <ConfirmActionModal
        isOpen={Boolean(deletingBook)}
        title="Delete book"
        message={`Are you sure you want to delete "${deletingBook?.title ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete book"
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingBook(null)}
        onConfirm={() => {
          if (!deletingBook) {
            return;
          }
          deleteMutation.mutate(deletingBook.id);
        }}
      />
    </Box>
  );
}
