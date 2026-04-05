import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, Input, Modal, Select, Text } from 'tharaday';

import { User } from '@/app/users/types';

type UserFormSubmitPayload = {
  name: string;
  email: string;
  password?: string;
  role_id: number;
  status_id: number;
};

type UserFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user?: User | null;
  isPending?: boolean;
  errorMessage?: string | null;
  roleOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSubmit: (payload: UserFormSubmitPayload) => void;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  roleId: string;
  statusId: string;
};

function toFormState(mode: 'create' | 'edit', user?: User | null): FormState {
  if (mode === 'edit' && user) {
    return {
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.role_id === null ? '' : String(user.role_id),
      statusId: user.status_id === null ? '' : String(user.status_id),
    };
  }

  return {
    name: '',
    email: '',
    password: '',
    roleId: '',
    statusId: '',
  };
}

export function UserFormModal({
  isOpen,
  mode,
  user,
  isPending = false,
  errorMessage,
  roleOptions,
  statusOptions,
  onClose,
  onSubmit,
}: Readonly<UserFormModalProps>) {
  const [formState, setFormState] = useState<FormState>(() =>
    toFormState(mode, user),
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormState(toFormState(mode, user));
    setFormError(null);
  }, [isOpen, mode, user]);

  useEffect(() => {
    if (!isOpen || mode !== 'create') {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      roleId: prev.roleId || roleOptions[0]?.value || '',
      statusId: prev.statusId || statusOptions[0]?.value || '',
    }));
  }, [isOpen, mode, roleOptions, statusOptions]);

  const title = useMemo(
    () => (mode === 'create' ? 'Add User' : `Edit User #${user?.id ?? ''}`),
    [mode, user?.id],
  );

  const submitLabel = mode === 'create' ? 'Create user' : 'Save changes';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const name = formState.name.trim();
    const email = formState.email.trim();
    const password = formState.password.trim();
    const roleId = Number(formState.roleId);
    const statusId = Number(formState.statusId);

    if (!name || !email) {
      setFormError('Name and email are required.');
      return;
    }

    if (!formState.roleId || !formState.statusId) {
      setFormError('Role and status are required.');
      return;
    }

    if (!Number.isFinite(roleId) || !Number.isFinite(statusId)) {
      setFormError('Selected role and status are invalid.');
      return;
    }

    if (mode === 'create' && password.length < 8) {
      setFormError('Password must have at least 8 characters.');
      return;
    }

    onSubmit({
      name,
      email,
      password: password || undefined,
      role_id: roleId,
      status_id: statusId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <Box display="flex" justifyContent="flex-end" gap={3}>
          <Button variant="subtle" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" disabled={isPending}>
            {isPending ? 'Saving...' : submitLabel}
          </Button>
        </Box>
      }
    >
      <form
        id="user-form"
        className="admin-form admin-form-grid"
        onSubmit={handleSubmit}
      >
        <Input
          label="Name"
          value={formState.name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              name: value,
            }));
          }}
          fullWidth
        />

        <Input
          label="Email"
          type="email"
          value={formState.email}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              email: value,
            }));
          }}
          fullWidth
        />

        <Input
          label={mode === 'create' ? 'Password' : 'Password (optional)'}
          type="password"
          value={formState.password}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              password: value,
            }));
          }}
          helperText={
            mode === 'edit'
              ? 'Leave empty to keep current password.'
              : undefined
          }
          fullWidth
        />

        <Select
          label="Role"
          value={formState.roleId}
          options={roleOptions}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              roleId: value,
            }));
          }}
          fullWidth
        />

        <Select
          label="Status"
          value={formState.statusId}
          options={statusOptions}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              statusId: value,
            }));
          }}
          fullWidth
        />
      </form>

      {(formError || errorMessage) && (
        <Text color="danger">{formError || errorMessage}</Text>
      )}
    </Modal>
  );
}
