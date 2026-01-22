import { Suspense } from 'react';
import ContactContent from './contact-content';

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactFallback />}>
      <ContactContent />
    </Suspense>
  );
}

function ContactFallback() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
      <p className="text-center text-muted-foreground">Loading...</p>
    </div>
  );
}
