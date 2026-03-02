'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, Text } from 'tharaday';

import { apiRequest } from '@/lib/api-client';

type DashboardCounts = {
  books: number;
  users: number;
};

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({ label, value }: Readonly<StatCardProps>) {
  return (
    <Box
      border
      borderRadius="md"
      backgroundColor="subtle"
      padding={6}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      <Text color="subtle">{label}</Text>
      <Text variant="h3" weight="bold">
        {value}
      </Text>
    </Box>
  );
}

async function loadDashboardCounts() {
  const [users, books] = await Promise.all([
    apiRequest<unknown[]>('/users'),
    apiRequest<unknown[]>('/books'),
  ]);

  return {
    users: users.length,
    books: books.length,
  } satisfies DashboardCounts;
}

export default function HomePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: loadDashboardCounts,
  });

  return (
    <Box display="flex" flexDirection="column" gap={6} paddingY="48px">
      <Text variant="h1" weight="bold">
        Operations Dashboard
      </Text>

      {isLoading && <Text color="subtle">Loading dashboard metrics...</Text>}

      {isError && (
        <Text color="danger">
          Failed to load dashboard data: {(error as Error).message}
        </Text>
      )}

      {data && (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
          gap={4}
        >
          <StatCard label="Users" value={data.users} />
          <StatCard label="Books" value={data.books} />
        </Box>
      )}
    </Box>
  );
}
