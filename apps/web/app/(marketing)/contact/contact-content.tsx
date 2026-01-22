'use client';

import { useSearchParams } from 'next/navigation';

export default function ContactContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
      {plan && (
        <p className="text-center text-forma-teal mb-4">
          Interested in the {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
        </p>
      )}
      <p className="text-center text-muted-foreground mb-8">
        Have questions? We'd love to hear from you.
      </p>
      <div className="max-w-md mx-auto text-center">
        <p className="text-muted-foreground">
          Email: support@forma.eg
        </p>
      </div>
    </div>
  );
}
