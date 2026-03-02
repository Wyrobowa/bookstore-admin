'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Box, Button, Loader, Text } from 'tharaday';

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
          <label className="admin-field">
            <span>Name</span>
            <input type="text" {...register('name')} />
            {errors.name && <small>{errors.name.message}</small>}
          </label>

          <label className="admin-field">
            <span>Email</span>
            <input type="email" {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>

          <label className="admin-field">
            <span>Password</span>
            <input type="password" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>

          <label className="admin-field">
            <span>Role ID</span>
            <input
              type="number"
              min={1}
              step={1}
              {...register('role_id', { valueAsNumber: true })}
            />
            {errors.role_id && <small>{errors.role_id.message}</small>}
          </label>

          <label className="admin-field">
            <span>Status ID</span>
            <input
              type="number"
              min={1}
              step={1}
              {...register('status_id', { valueAsNumber: true })}
            />
            {errors.status_id && <small>{errors.status_id.message}</small>}
          </label>

          {createUserMutation.isError && (
            <Text color="danger">
              {(createUserMutation.error as Error).message}
            </Text>
          )}

          <Box>
            <Button type="submit" isLoading={createUserMutation.isPending}>
              Create user
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
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role_id ?? '-'}</td>
                    <td>{user.status_id ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    </Box>
  );
}
