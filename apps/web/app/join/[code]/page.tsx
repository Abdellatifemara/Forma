import dynamic from 'next/dynamic';

const JoinPage = dynamic(() => import('./join-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ code: '_placeholder' }];
}

export default function Page() {
  return <JoinPage />;
}
