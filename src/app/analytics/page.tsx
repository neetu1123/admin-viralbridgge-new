import React from 'react';
import AppLayout from '@/src/components/AppLayout';
import AnalyticsContent from './components/AnalyticsContent';

export default function AnalyticsPage() {
  return (
    <AppLayout role="brand">
      <AnalyticsContent />
    </AppLayout>
  );
}