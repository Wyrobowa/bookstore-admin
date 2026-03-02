import {
  Box,
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
};

export function UsersTable({ users }: Readonly<UsersTableProps>) {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role_id ?? '-'}</TableCell>
              <TableCell>{user.status_id ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
