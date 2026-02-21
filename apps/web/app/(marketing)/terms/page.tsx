export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: January 2025</p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Forma, you accept and agree to be bound by the terms and
            provisions of this agreement. If you do not agree to these terms, please do not
            use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>
            Forma provides a fitness tracking and workout management platform. Our services
            include workout planning, exercise tracking, nutrition logging, and progress
            monitoring tools.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You must provide accurate and
            complete information when creating an account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Share your account credentials with others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Health Disclaimer</h2>
          <p>
            Forma is not a medical service. The workout and nutrition information provided
            is for general informational purposes only. Always consult with a qualified
            healthcare provider before starting any exercise program or making changes to
            your diet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p>
            All content, features, and functionality of Forma are owned by us and are
            protected by international copyright, trademark, and other intellectual
            property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            Forma shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of
            any significant changes via email or through the application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:support@forma.eg" className="text-forma-orange hover:underline">
              support@forma.eg
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
