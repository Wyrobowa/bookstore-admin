import { ReactNode } from 'react';
import { Box, Loader, Pagination, Text } from 'tharaday';

type PaginatedTableSectionProps = {
  title: string;
  itemLabel: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  showingCount: number;
  totalCount: number;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  children: ReactNode;
};

export function PaginatedTableSection({
  title,
  itemLabel,
  isLoading,
  isError,
  errorMessage,
  showingCount,
  totalCount,
  totalPages,
  page,
  onPageChange,
  children,
}: Readonly<PaginatedTableSectionProps>) {
  return (
    <Box
      border
      borderRadius="md"
      padding={6}
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <Text variant="h4" weight="bold">
        {title}
      </Text>

      {isLoading && (
        <Box display="flex" alignItems="center" gap={3}>
          <Loader size="md" />
          <Text color="subtle">Loading {itemLabel}...</Text>
        </Box>
      )}

      {isError && (
        <Text color="danger">
          Failed to fetch {itemLabel}: {errorMessage}
        </Text>
      )}

      {!isLoading && !isError && (
        <Box display="flex" flexDirection="column" gap={4}>
          <Text color="subtle">
            Showing {showingCount} of {totalCount} {itemLabel}
          </Text>

          {children}

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onPageChange={onPageChange}
              showFirstLast
            />
          )}
        </Box>
      )}
    </Box>
  );
}
