import React from 'react';
import AppLayout from '@/src/components/AppLayout';
import MyCreatorsContent from './components/MyCreatorsContent';

export default function MyCreatorsPage() {
  return (
    <AppLayout role="brand">
      <MyCreatorsContent />
    </AppLayout>
  );
}