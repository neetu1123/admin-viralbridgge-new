import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../../components/AdminTopNavbar';
import AdminSupportCaseContent from '../components/AdminSupportCaseContent';

interface AdminSupportCasePageProps {
  params: Promise<{ caseId: string }>;
}

export default async function AdminSupportCasePage({ params }: AdminSupportCasePageProps) {
  const { caseId } = await params;
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminSupportCaseContent caseId={caseId} />
    </AppLayout>
  );
}
