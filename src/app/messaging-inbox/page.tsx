import AppLayout from '@/src/components/AppLayout';
import MessagingContent from './components/MessagingContent';

export default function MessagingInboxPage() {
  return (
    <AppLayout role="creator">
      <MessagingContent />
    </AppLayout>
  );
}