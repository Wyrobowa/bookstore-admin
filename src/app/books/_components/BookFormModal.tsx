import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Box, Button, Input, Modal, Select, Text } from 'tharaday';

import { Book } from '@/app/books/types';

type BookFormSubmitPayload = {
  title: string;
  description: string | null;
  tag_id: number;
  status_id: number;
  author_id: number;
  publisher_id: number;
  pages: number | null;
};

type BookFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  book?: Book | null;
  isPending?: boolean;
  errorMessage?: string | null;
  tagOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  authorOptions: Array<{ value: string; label: string }>;
  publisherOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSubmit: (payload: BookFormSubmitPayload) => void;
};

type FormState = {
  title: string;
  description: string;
  tagId: string;
  statusId: string;
  authorId: string;
  publisherId: string;
  pages: string;
};

function toFormState(mode: 'create' | 'edit', book?: Book | null): FormState {
  if (mode === 'edit' && book) {
    return {
      title: book.title,
      description: book.description || '',
      tagId: book.tag_id === null ? '' : String(book.tag_id),
      statusId: book.status_id === null ? '' : String(book.status_id),
      authorId: book.author_id === null ? '' : String(book.author_id),
      publisherId: book.publisher_id === null ? '' : String(book.publisher_id),
      pages: book.pages === null ? '' : String(book.pages),
    };
  }

  return {
    title: '',
    description: '',
    tagId: '',
    statusId: '',
    authorId: '',
    publisherId: '',
    pages: '',
  };
}

export function BookFormModal({
  isOpen,
  mode,
  book,
  isPending = false,
  errorMessage,
  tagOptions,
  statusOptions,
  authorOptions,
  publisherOptions,
  onClose,
  onSubmit,
}: Readonly<BookFormModalProps>) {
  const [formState, setFormState] = useState<FormState>(() =>
    toFormState(mode, book),
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormState(toFormState(mode, book));
    setFormError(null);
  }, [isOpen, mode, book]);

  useEffect(() => {
    if (!isOpen || mode !== 'create') {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      tagId: prev.tagId || tagOptions[0]?.value || '',
      statusId: prev.statusId || statusOptions[0]?.value || '',
      authorId: prev.authorId || authorOptions[0]?.value || '',
      publisherId: prev.publisherId || publisherOptions[0]?.value || '',
    }));
  }, [
    authorOptions,
    isOpen,
    mode,
    publisherOptions,
    statusOptions,
    tagOptions,
  ]);

  const title = useMemo(
    () => (mode === 'create' ? 'Add Book' : `Edit Book #${book?.id ?? ''}`),
    [mode, book?.id],
  );

  const submitLabel = mode === 'create' ? 'Create book' : 'Save changes';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const titleValue = formState.title.trim();
    const descriptionValue = formState.description.trim();
    const tagId = Number(formState.tagId);
    const statusId = Number(formState.statusId);
    const authorId = Number(formState.authorId);
    const publisherId = Number(formState.publisherId);
    const pages =
      formState.pages.trim() === '' ? null : Number(formState.pages);

    if (!titleValue) {
      setFormError('Title is required.');
      return;
    }

    if (
      !formState.tagId ||
      !formState.statusId ||
      !formState.authorId ||
      !formState.publisherId
    ) {
      setFormError('Type, status, author, and publisher are required.');
      return;
    }

    if (
      !Number.isFinite(tagId) ||
      !Number.isFinite(statusId) ||
      !Number.isFinite(authorId) ||
      !Number.isFinite(publisherId)
    ) {
      setFormError('Selected type, status, author, or publisher is invalid.');
      return;
    }

    if (pages !== null && !Number.isFinite(pages)) {
      setFormError('Pages must be a valid number.');
      return;
    }

    onSubmit({
      title: titleValue,
      description: descriptionValue || null,
      tag_id: tagId,
      status_id: statusId,
      author_id: authorId,
      publisher_id: publisherId,
      pages,
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
          <Button type="submit" form="book-form" disabled={isPending}>
            {isPending ? 'Saving...' : submitLabel}
          </Button>
        </Box>
      }
    >
      <form
        id="book-form"
        className="admin-form admin-form-grid"
        onSubmit={handleSubmit}
      >
        <Input
          label="Title"
          value={formState.title}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              title: value,
            }));
          }}
          fullWidth
        />

        <Input
          label="Description"
          value={formState.description}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              description: value,
            }));
          }}
          fullWidth
        />

        <Select
          label="Type"
          value={formState.tagId}
          options={tagOptions}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              tagId: value,
            }));
          }}
          fullWidth
        />

        <Select
          label="Status"
          value={formState.statusId}
          options={statusOptions}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              statusId: value,
            }));
          }}
          fullWidth
        />

        <Select
          label="Author"
          value={formState.authorId}
          options={authorOptions}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              authorId: value,
            }));
          }}
          fullWidth
        />

        <Select
          label="Publisher"
          value={formState.publisherId}
          options={publisherOptions}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              publisherId: value,
            }));
          }}
          fullWidth
        />

        <Input
          label="Pages"
          type="number"
          min={1}
          step={1}
          value={formState.pages}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setFormState((prev) => ({
              ...prev,
              pages: value,
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
