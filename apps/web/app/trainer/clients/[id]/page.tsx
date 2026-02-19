import dynamic from 'next/dynamic';

const ClientDetailPage = dynamic(() => import('./client-page'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <ClientDetailPage />;
}
