import dynamic from 'next/dynamic';

const TrainerDetailPage = dynamic(() => import('./trainer-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <TrainerDetailPage />;
}
