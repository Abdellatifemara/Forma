import dynamic from 'next/dynamic';

const ProgramBuilderPage = dynamic(() => import('./program-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <ProgramBuilderPage />;
}
