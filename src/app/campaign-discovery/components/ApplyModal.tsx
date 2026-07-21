'use client';
import React from 'react';
import { toast } from 'sonner';
import Modal from '@/src/components/ui/Modal';
import ApplyCampaignForm, { type ApplyCampaignData } from './ApplyCampaignForm';

interface ApplyModalProps {
  campaign: ApplyCampaignData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ campaign, onClose, onSuccess }: ApplyModalProps) {
  return (
    <Modal open onClose={onClose} title="Apply to Campaign" size="md">
      <ApplyCampaignForm
        campaign={campaign}
        onCancel={onClose}
        onSuccess={() => {
          toast.success('Application submitted!');
          onSuccess();
        }}
        onError={(message) => toast.error(message)}
      />
    </Modal>
  );
}
