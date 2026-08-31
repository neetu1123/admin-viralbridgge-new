'use client';

import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Scale } from 'lucide-react';
import MyDisputesPanel from '@/src/components/disputes/MyDisputesPanel';
import OpenDisputeModal from '@/src/components/disputes/OpenDisputeModal';
import DisputeContactPanel from '@/src/components/disputes/DisputeContactPanel';
import Link from 'next/link';

export default function CreatorDisputesContent() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Scale size={22} className="text-violet-600" />
            Disputes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Raise and track disputes related to campaigns, deliverables, and payments</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          Raise Dispute
        </button>
      </div>

      <MyDisputesPanel role="creator" refreshKey={refreshKey} />

      <DisputeContactPanel />

      <p className="text-xs text-slate-400 mt-6">
        Disputes are also available from{' '}
        <Link href="/my-applications" className="text-violet-600 hover:underline">My Campaigns</Link>
        {' '}for active collaborations.
      </p>

      <OpenDisputeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        role="creator"
        campaignId=""
        campaignTitle=""
        onSuccess={() => {
          setRefreshKey((k) => k + 1);
          setShowModal(false);
        }}
      />
    </div>
  );
}
