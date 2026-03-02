'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, Loader, Text } from 'tharaday';

import { apiRequest } from '@/lib/api-client';

type Book = {
  id: number;
  title: string;
  status: string | null;
  author_first_name: string | null;
  author_last_name: string | null;
};

async function loadBooks() {
  return apiRequest<Book[]>('/books');
}

export default function BooksPage() {
  const booksQuery = useQuery({
    queryKey: ['books'],
    queryFn: loadBooks,
  });

  return (
    <Box display="flex" flexDirection="column" gap={6} paddingY="48px">
      <Box display="flex" flexDirection="column" gap={2}>
        <Text variant="h1" weight="bold">
          Book Catalog
        </Text>
        <Text color="subtle">Read-only list for quick operational checks.</Text>
      </Box>

      {booksQuery.isLoading && (
        <Box display="flex" alignItems="center" gap={3}>
          <Loader size="md" />
          <Text color="subtle">Loading books...</Text>
        </Box>
      )}

      {booksQuery.isError && (
        <Text color="danger">
          Failed to fetch books: {(booksQuery.error as Error).message}
        </Text>
      )}

      {booksQuery.data && (
        <Box className="admin-table-wrap" border borderRadius="md">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {booksQuery.data.map((book) => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>
                    {[book.author_first_name, book.author_last_name]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </td>
                  <td>{book.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
}
