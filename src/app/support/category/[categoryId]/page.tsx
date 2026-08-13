import SupportCategoryContent from '../../components/SupportCategoryContent';
import SupportLayoutShell from '../../components/SupportLayoutShell';

interface Props {
  params: Promise<{ categoryId: string }>;
}

export default async function SupportCategoryPage({ params }: Props) {
  const { categoryId } = await params;
  return (
    <SupportLayoutShell>
      <SupportCategoryContent categoryId={categoryId} />
    </SupportLayoutShell>
  );
}
