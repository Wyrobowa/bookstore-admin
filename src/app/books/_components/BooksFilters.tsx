import { Box, Input, Select } from 'tharaday';

type FilterOption = {
  value: string;
  label: string;
};

type BooksFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: FilterOption[];
};

export function BooksFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}: Readonly<BooksFiltersProps>) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
      gap={4}
    >
      <Input
        label="Search"
        placeholder="Title or author"
        value={searchValue}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        fullWidth
      />

      <Select
        label="Status"
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.currentTarget.value)}
        options={statusOptions}
        fullWidth
      />
    </Box>
  );
}
