import dynamic from 'next/dynamic';

const ClientMealPlanPage = dynamic(() => import('./meal-plan-client'), { ssr: false });

export async function generateStaticParams() {
  return [{ id: '_placeholder' }];
}

export default function Page() {
  return <ClientMealPlanPage />;
}
