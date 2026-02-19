import dynamic from 'next/dynamic';

const EditClientPage = dynamic(() => import('./edit-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <EditClientPage />;
}
