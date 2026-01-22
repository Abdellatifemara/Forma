export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: January 2025</p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit a
            website. They help the website remember your preferences and improve your
            browsing experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>Forma uses cookies for the following purposes:</p>

          <h3 className="text-xl font-medium mt-6 mb-3">Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly. They enable
            core functionality such as security, authentication, and session management.
            You cannot opt out of these cookies.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Functional Cookies</h3>
          <p>
            These cookies remember your preferences and choices (such as language or theme
            settings) to provide a more personalized experience.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Analytics Cookies</h3>
          <p>
            We use analytics cookies to understand how visitors interact with our website.
            This helps us improve our services and user experience. These cookies collect
            information anonymously.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-4 py-2 text-left">Cookie Name</th>
                  <th className="border border-border px-4 py-2 text-left">Purpose</th>
                  <th className="border border-border px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2">forma-token</td>
                  <td className="border border-border px-4 py-2">Authentication session</td>
                  <td className="border border-border px-4 py-2">7 days</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">theme</td>
                  <td className="border border-border px-4 py-2">Theme preference (dark/light)</td>
                  <td className="border border-border px-4 py-2">1 year</td>
                </tr>
                <tr>
                  <td className="border border-border px-4 py-2">locale</td>
                  <td className="border border-border px-4 py-2">Language preference</td>
                  <td className="border border-border px-4 py-2">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>View what cookies are stored on your device</li>
            <li>Delete all or specific cookies</li>
            <li>Block cookies from being set</li>
            <li>Set preferences for certain websites</li>
          </ul>
          <p className="mt-4">
            Please note that blocking essential cookies may affect the functionality of the
            website and you may not be able to access certain features.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
          <p>
            We may use third-party services that set their own cookies, such as analytics
            providers. These cookies are governed by the respective third parties privacy
            policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. Any changes will be posted
            on this page with an updated effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at{' '}
            <a href="mailto:support@forma.eg" className="text-forma-teal hover:underline">
              support@forma.eg
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
