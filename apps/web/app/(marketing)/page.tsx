import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { Pricing } from '@/components/marketing/pricing';
import { TrainersSection } from '@/components/marketing/trainers-section';
import { CTA } from '@/components/marketing/cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <TrainersSection />
      <Pricing />
      <CTA />
    </>
  );
}
