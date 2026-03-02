'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Box } from 'tharaday';

import { PaginatedTableSection } from '@/app/_components/PaginatedTableSection';
import { useClientPagination } from '@/app/_hooks/useClientPagination';
import { CreateUserCard } from '@/app/users/_components/CreateUserCard';
import { UsersFilters } from '@/app/users/_components/UsersFilters';
import { UsersTable } from '@/app/users/_components/UsersTable';
import { User } from '@/app/users/types';
import { apiRequest } from '@/lib/api-client';

const USERS_PAGE_SIZE = 10;
const ALL_FILTER = 'all';
const NONE_FILTER = 'none';

async function loadUsers() {
  return apiRequest<User[]>('/users');
}

export default function UsersPage() {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: loadUsers,
  });

  const users = usersQuery.data || [];
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return users.filter((user) => {
      const roleMatches =
        roleFilter === ALL_FILTER
          ? true
          : roleFilter === NONE_FILTER
            ? user.role_id === null
            : user.role_id === Number(roleFilter);

      const statusMatches =
        statusFilter === ALL_FILTER
          ? true
          : statusFilter === NONE_FILTER
            ? user.status_id === null
            : user.status_id === Number(statusFilter);

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
    const roleIds = Array.from(
      new Set(
        users
          .map((user) => user.role_id)
          .filter((value): value is number => value !== null),
      ),
    ).sort((a, b) => a - b);

    return [
      { value: ALL_FILTER, label: 'All roles' },
      { value: NONE_FILTER, label: 'No role' },
      ...roleIds.map((value) => ({
        value: String(value),
        label: `Role ${value}`,
      })),
    ];
  }, [users]);

  const statusOptions = useMemo(() => {
    const statusIds = Array.from(
      new Set(
        users
          .map((user) => user.status_id)
          .filter((value): value is number => value !== null),
      ),
    ).sort((a, b) => a - b);

    return [
      { value: ALL_FILTER, label: 'All statuses' },
      { value: NONE_FILTER, label: 'No status' },
      ...statusIds.map((value) => ({
        value: String(value),
        label: `Status ${value}`,
      })),
    ];
  }, [users]);

  const { page, setPage, totalPages, paginatedItems } = useClientPagination({
    items: filteredUsers,
    pageSize: USERS_PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [roleFilter, searchValue, setPage, statusFilter]);

  return (
    <Box display="flex" flexDirection="column" gap={8}>
      <CreateUserCard onCreated={() => setPage(1)} />

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
        <UsersTable users={paginatedItems} />
      </PaginatedTableSection>
    </Box>
  );
}
