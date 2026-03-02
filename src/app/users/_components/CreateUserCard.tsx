import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Box, Button, Input, Text } from 'tharaday';

import { CreateUserFormValues, createUserSchema } from '@/app/users/schema';
import { User } from '@/app/users/types';
import { apiRequest } from '@/lib/api-client';

type CreateUserCardProps = {
  onCreated?: () => void;
};

const DEFAULT_VALUES: CreateUserFormValues = {
  name: '',
  email: '',
  password: '',
  role_id: 2,
  status_id: 1,
};

export function CreateUserCard({ onCreated }: Readonly<CreateUserCardProps>) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserFormValues) =>
      apiRequest<User>('/users', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: async () => {
      reset(DEFAULT_VALUES);
      onCreated?.();
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
  });

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
            {createUserMutation.isPending ? 'Creating user...' : 'Create user'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
