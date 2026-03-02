'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Input,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from 'tharaday';

import {
  CreateUserFormValues,
  createUserSchema,
} from '@/features/users/user-schema';
import { apiRequest } from '@/lib/api-client';

type User = {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  status_id: number | null;
};

async function loadUsers() {
  return apiRequest<User[]>('/users');
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role_id: 2,
      status_id: 1,
    },
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: loadUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserFormValues) =>
      apiRequest<User>('/users', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: async () => {
      reset({
        name: '',
        email: '',
        password: '',
        role_id: 2,
        status_id: 1,
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={8} paddingY="48px">
      <Box display="flex" flexDirection="column" gap={2}>
        <Text variant="h1" weight="bold">
          User Management
        </Text>
        <Text color="subtle">
          Create users and review account records from one place.
        </Text>
      </Box>

      <Box
        border
        borderRadius="md"
        padding={6}
        display="flex"
        flexDirection="column"
        gap={4}
      >
        <Text variant="h4" weight="bold">
          Create User
        </Text>

        <form
          className="admin-form admin-form-grid"
          onSubmit={handleSubmit((values) => createUserMutation.mutate(values))}
        >
          <Input
            type="text"
            label="Name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            fullWidth
            {...register('name')}
          />

          <Input
            type="email"
            label="Email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <Input
            type="password"
            label="Password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            fullWidth
            {...register('password')}
          />

          <Input
            type="number"
            label="Role ID"
            min={1}
            step={1}
            error={Boolean(errors.role_id)}
            helperText={errors.role_id?.message}
            fullWidth
            {...register('role_id', { valueAsNumber: true })}
          />

          <Input
            type="number"
            label="Status ID"
            min={1}
            step={1}
            error={Boolean(errors.status_id)}
            helperText={errors.status_id?.message}
            fullWidth
            {...register('status_id', { valueAsNumber: true })}
          />

          {createUserMutation.isError && (
            <Text color="danger">
              {(createUserMutation.error as Error).message}
            </Text>
          )}

          <Box>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending
                ? 'Creating user...'
                : 'Create user'}
            </Button>
          </Box>
        </form>
      </Box>

      <Box
        border
        borderRadius="md"
        padding={6}
        display="flex"
        flexDirection="column"
        gap={4}
      >
        <Text variant="h4" weight="bold">
          Existing Users
        </Text>

        {usersQuery.isLoading && (
          <Box display="flex" alignItems="center" gap={3}>
            <Loader size="md" />
            <Text color="subtle">Loading users...</Text>
          </Box>
        )}

        {usersQuery.isError && (
          <Text color="danger">
            Failed to fetch users: {(usersQuery.error as Error).message}
          </Text>
        )}

        {usersQuery.data && (
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
                {usersQuery.data.map((user) => (
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
        )}
      </Box>
    </Box>
  );
}
