'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/src/components/ui/Modal';
import { brandApi } from '@/src/lib/api';
import { extractList } from '@/src/lib/mappers';

interface InviteCreatorModalProps {
  creatorId: string;
  creatorName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteCreatorModal({
  creatorId,
  creatorName,
  onClose,
  onSuccess,
}: InviteCreatorModalProps) {
  const [campaigns, setCampaigns] = useState<Array<{ id: string; title: string; status?: string }>>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    brandApi
      .getCampaigns({ limit: 50 })
      .then((res) => {
        const list = extractList<{ id: string; title: string; status?: string }>(res).filter(
          (c) => !c.status || ['ACTIVE', 'APPROVED', 'LIVE', 'OPEN'].includes(String(c.status).toUpperCase()),
        );
        setCampaigns(list.length > 0 ? list : extractList(res));
        if (list[0]) setSelectedCampaignId(list[0].id);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to load campaigns');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!selectedCampaignId) {
      toast.error('Select a campaign first');
      return;
    }
    setSubmitting(true);
    try {
      await brandApi.inviteCreator(selectedCampaignId, creatorId);
      toast.success(`Invite sent${creatorName ? ` to ${creatorName}` : ''}!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Invite to Campaign" size="md">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Choose a campaign to invite{creatorName ? ` ${creatorName}` : ' this creator'} to collaborate on.
        </p>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
            No active campaigns found. Create a campaign first, then invite creators.
          </p>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="invite-campaign">
              Campaign
            </label>
            <select
              id="invite-campaign"
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || loading || campaigns.length === 0}
            onClick={handleInvite}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-70"
          >
            {submitting ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
