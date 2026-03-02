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

import { User } from '@/app/users/types';

type UsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UsersTable({
  users,
  onEdit,
  onDelete,
}: Readonly<UsersTableProps>) {
  return (
    <Box className="admin-table-wrap">
      <Table striped hoverable>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role || '-'}</TableCell>
              <TableCell>{user.status || '-'}</TableCell>
              <TableCell>
                <Box display="flex" gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    intent="danger"
                    variant="outline"
                    onClick={() => onDelete(user)}
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
