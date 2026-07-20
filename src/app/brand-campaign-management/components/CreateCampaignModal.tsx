'use client';
import React from 'react';
import { toast } from 'sonner';
import Modal from '@/src/components/ui/Modal';
import CreateCampaignForm from './CreateCampaignForm';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateCampaignModal({ onClose, onCreated }: CreateCampaignModalProps) {
  return (
    <Modal open onClose={onClose} title="Create New Campaign" size="lg">
      <CreateCampaignForm
        className="max-h-[70vh] overflow-y-auto scrollbar-thin pr-1"
        onCancel={onClose}
        onSuccess={() => {
          toast.success('Campaign created successfully!');
          onCreated?.();
          onClose();
        }}
        onError={(message) => toast.error(message)}
      />
    </Modal>
  );
}
