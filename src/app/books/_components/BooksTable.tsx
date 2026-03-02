import {
  Box,
  Button,
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
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
};

export function BooksTable({
  books,
  onEdit,
  onDelete,
}: Readonly<BooksTableProps>) {
  return (
    <Box className="admin-table-wrap" border borderRadius="md">
      <Table striped hoverable>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell>
                <Box display="flex" gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(book)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    intent="danger"
                    onClick={() => onDelete(book)}
                  >
                    Delete
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
