import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '@/src/app/admin-panel/components/AdminTopNavbar';
import LeadFormPageContent from '../components/LeadFormPageContent';

export default function NewLeadPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <LeadFormPageContent mode="create" />
    </AppLayout>
  );
}
