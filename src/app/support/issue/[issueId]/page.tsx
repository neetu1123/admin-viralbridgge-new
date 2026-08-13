import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SupportIssueContent from '../../components/SupportIssueContent';
import SupportLayoutShell from '../../components/SupportLayoutShell';

interface Props {
  params: Promise<{ issueId: string }>;
}

export default async function SupportIssuePage({ params }: Props) {
  const { issueId } = await params;
  return (
    <SupportLayoutShell>
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>}>
        <SupportIssueContent issueId={issueId} />
      </Suspense>
    </SupportLayoutShell>
  );
}
