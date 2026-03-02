import { Box, Button, Modal, Text } from 'tharaday';

type ConfirmActionModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel,
  isPending = false,
  onConfirm,
  onClose,
}: Readonly<ConfirmActionModalProps>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <Box display="flex" justifyContent="flex-end" gap={3}>
          <Button variant="subtle" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button intent="danger" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Working...' : confirmLabel}
          </Button>
        </Box>
      }
    >
      <Text>{message}</Text>
    </Modal>
  );
}
