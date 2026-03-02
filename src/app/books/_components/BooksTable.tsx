import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'tharaday';

import { Book } from '@/app/books/types';

type BooksTableProps = {
  books: Book[];
};

export function BooksTable({ books }: Readonly<BooksTableProps>) {
  return (
    <Box className="admin-table-wrap" border borderRadius="md">
      <Table striped hoverable>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.id}</TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>
                {[book.author_first_name, book.author_last_name]
                  .filter(Boolean)
                  .join(' ') || '-'}
              </TableCell>
              <TableCell>{book.status || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
