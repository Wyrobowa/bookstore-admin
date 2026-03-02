'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Text } from 'tharaday';

import { ConfirmActionModal } from '@/app/_components/ConfirmActionModal';
import { PaginatedTableSection } from '@/app/_components/PaginatedTableSection';
import { useClientPagination } from '@/app/_hooks/useClientPagination';
import { UserFormModal } from '@/app/users/_components/UserFormModal';
import { UsersFilters } from '@/app/users/_components/UsersFilters';
import { UsersTable } from '@/app/users/_components/UsersTable';
import { User } from '@/app/users/types';
import { apiRequest } from '@/lib/api-client';

const USERS_PAGE_SIZE = 10;
const ALL_FILTER = 'all';
const NONE_FILTER = 'none';

type UserFormPayload = {
  name: string;
  email: string;
  password?: string;
  role_id: number;
  status_id: number;
};

type LookupItem = {
  id: number;
  name: string;
};

async function loadUsers() {
  return apiRequest<User[]>('/users');
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: loadUsers,
  });
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiRequest<LookupItem[]>('/roles'),
  });
  const statusesQuery = useQuery({
    queryKey: ['statuses'],
    queryFn: () => apiRequest<LookupItem[]>('/statuses'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: UserFormPayload) =>
      apiRequest<User>('/users', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: async () => {
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UserFormPayload;
    }) =>
      apiRequest<User>('/users', {
        method: 'PATCH',
        body: {
          id: userId,
          ...payload,
        },
      }),
    onSuccess: async () => {
      setEditingUser(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest<null>(`/users?id=${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      setDeletingUser(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
  });

  const users = usersQuery.data || [];
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return users.filter((user) => {
      const roleMatches =
        roleFilter === ALL_FILTER
          ? true
          : roleFilter === NONE_FILTER
            ? user.role === null
            : (user.role || '').toLowerCase() === roleFilter;

      const statusMatches =
        statusFilter === ALL_FILTER
          ? true
          : statusFilter === NONE_FILTER
            ? user.status === null
            : (user.status || '').toLowerCase() === statusFilter;

      const searchMatches =
        normalizedSearch.length === 0
          ? true
          : `${user.name} ${user.email}`
              .toLowerCase()
              .includes(normalizedSearch);

      return roleMatches && statusMatches && searchMatches;
    });
  }, [roleFilter, searchValue, statusFilter, users]);

  const roleOptions = useMemo(() => {
    const roles = rolesQuery.data || [];

    return [
      { value: ALL_FILTER, label: 'All roles' },
      { value: NONE_FILTER, label: 'No role' },
      ...roles.map((role) => ({
        value: role.name.toLowerCase(),
        label: role.name,
      })),
    ];
  }, [rolesQuery.data]);

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

  const roleModalOptions = useMemo(() => {
    return (rolesQuery.data || []).map((role) => ({
      value: String(role.id),
      label: role.name,
    }));
  }, [rolesQuery.data]);

  const statusModalOptions = useMemo(() => {
    return (statusesQuery.data || []).map((status) => ({
      value: String(status.id),
      label: status.name,
    }));
  }, [statusesQuery.data]);

  const { page, setPage, totalPages, paginatedItems } = useClientPagination({
    items: filteredUsers,
    pageSize: USERS_PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [roleFilter, searchValue, setPage, statusFilter]);

  return (
    <Box display="flex" flexDirection="column" gap={8}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={4}
      >
        <Text variant="h3" weight="bold">
          Users
        </Text>
        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
          Add user
        </Button>
      </Box>

      <UsersFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleOptions={roleOptions}
        statusOptions={statusOptions}
      />

      <PaginatedTableSection
        title="Existing Users"
        itemLabel="users"
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        errorMessage={(usersQuery.error as Error | null)?.message}
        showingCount={paginatedItems.length}
        totalCount={filteredUsers.length}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
      >
        <UsersTable
          users={paginatedItems}
          onEdit={(user) => setEditingUser(user)}
          onDelete={(user) => setDeletingUser(user)}
        />
      </PaginatedTableSection>

      <UserFormModal
        isOpen={isCreateOpen}
        mode="create"
        isPending={createMutation.isPending}
        errorMessage={(createMutation.error as Error | null)?.message}
        roleOptions={roleModalOptions}
        statusOptions={statusModalOptions}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />

      <UserFormModal
        isOpen={Boolean(editingUser)}
        mode="edit"
        user={editingUser}
        isPending={editMutation.isPending}
        errorMessage={(editMutation.error as Error | null)?.message}
        roleOptions={roleModalOptions}
        statusOptions={statusModalOptions}
        onClose={() => setEditingUser(null)}
        onSubmit={(payload) => {
          if (!editingUser) {
            return;
          }
          editMutation.mutate({ userId: editingUser.id, payload });
        }}
      />

      <ConfirmActionModal
        isOpen={Boolean(deletingUser)}
        title="Delete user"
        message={`Are you sure you want to delete "${deletingUser?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete user"
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (!deletingUser) {
            return;
          }
          deleteMutation.mutate(deletingUser.id);
        }}
      />
    </Box>
  );
}
