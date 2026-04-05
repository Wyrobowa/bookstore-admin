import { ChangeEvent } from 'react';
import { Box, Input, Select } from 'tharaday';

type FilterOption = {
  value: string;
  label: string;
};

type UsersFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  roleOptions: FilterOption[];
  statusOptions: FilterOption[];
};

export function UsersFilters({
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  roleOptions,
  statusOptions,
}: Readonly<UsersFiltersProps>) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
      gap={4}
    >
      <Input
        label="Search"
        placeholder="Name or email"
        value={searchValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.currentTarget.value)}
        fullWidth
      />

      <Select
        label="Role"
        value={roleFilter}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onRoleFilterChange(event.currentTarget.value)
        }
        options={roleOptions}
        fullWidth
      />

      <Select
        label="Status"
        value={statusFilter}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onStatusFilterChange(event.currentTarget.value)
        }
        options={statusOptions}
        fullWidth
      />
    </Box>
  );
}
