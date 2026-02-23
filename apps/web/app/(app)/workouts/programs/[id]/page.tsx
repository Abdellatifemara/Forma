import dynamic from 'next/dynamic';

const ProgramDetailPage = dynamic(() => import('./program-detail-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <ProgramDetailPage />;
}
