import { SupportCaseDetailContent } from '../../components/SupportCaseContent';
import SupportLayoutShell from '../../components/SupportLayoutShell';

interface Props {
  params: Promise<{ caseId: string }>;
}

export default async function SupportCasePage({ params }: Props) {
  const { caseId } = await params;
  return (
    <SupportLayoutShell>
      <SupportCaseDetailContent caseId={caseId} />
    </SupportLayoutShell>
  );
}
