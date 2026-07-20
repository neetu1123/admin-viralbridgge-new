'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import CreateCampaignForm from '../../components/CreateCampaignForm';

export default function CreateCampaignPageContent() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" richColors />

      <Link
        href="/brand-campaign-management"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Campaigns
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create New Campaign</h1>
        <p className="text-slate-500 text-sm mt-1">
          Set up your campaign details and start receiving creator applications.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <CreateCampaignForm
          onCancel={() => router.push('/brand-campaign-management')}
          onSuccess={() => {
            toast.success('Campaign created successfully!');
            router.push('/brand-campaign-management');
          }}
          onError={(message) => toast.error(message)}
        />
      </div>
    </div>
  );
}
