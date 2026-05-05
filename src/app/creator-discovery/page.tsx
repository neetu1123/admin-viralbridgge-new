import React from 'react';
import AppLayout from '@/src/components/AppLayout';
import CreatorDiscoveryContent from './components/CreatorDiscoveryContent';

export default function CreatorDiscoveryPage() {
  return (
    <AppLayout role="brand">
      <CreatorDiscoveryContent />
    </AppLayout>
  );
}
