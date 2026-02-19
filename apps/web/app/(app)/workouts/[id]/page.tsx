import dynamic from 'next/dynamic';

const ActiveWorkoutPage = dynamic(() => import('./workout-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <ActiveWorkoutPage />;
}
