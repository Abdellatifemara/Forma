export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: January 2025</p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Account information (name, email, password)</li>
            <li>Profile information (fitness goals, experience level)</li>
            <li>Workout and exercise data</li>
            <li>Nutrition and meal tracking data</li>
            <li>Body measurements and progress photos (if provided)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your workout and nutrition recommendations</li>
            <li>Track your fitness progress over time</li>
            <li>Send you updates and notifications about your account</li>
            <li>Respond to your comments, questions, and requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. We use Supabase
            for our database infrastructure, which provides enterprise-grade security. We
            implement appropriate technical and organizational measures to protect your
            personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information only in
            the following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>With your consent</li>
            <li>With trainers you explicitly connect with through the platform</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze
            usage patterns, and deliver personalized content. You can control cookie
            preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide
            you services. You can request deletion of your data at any time by contacting us
            or through your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any
            changes by posting the new policy on this page and updating the effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@forma.eg" className="text-forma-teal hover:underline">
              support@forma.eg
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
