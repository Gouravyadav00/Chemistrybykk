import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ChemistryByKK collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 flex items-center justify-between">
        <Link href="/" className="block">
          <Logo size="md" />
        </Link>
        <Link href="/" className="clay-btn-secondary text-sm">
          Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="clay p-6 sm:p-10">
          <h1 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-clay-muted text-sm mt-2">
            Last updated: May 2026
          </p>

          <Section title="Who we are">
            <p>
              ChemistryByKK is a learning portal operated by Khyati Kaushik
              (referred to as "we", "us" or "ChemistryByKK") aimed at Class
              9–12 chemistry students. This policy explains what data we
              collect, how we use it and what choices you have.
            </p>
          </Section>

          <Section title="What we collect">
            <ul>
              <li>
                <b>Account details</b> you provide when signing up — email,
                name, class, school, city and (optionally) phone number.
              </li>
              <li>
                <b>Doubts</b> you post, including the text, any image or PDF
                attachments you upload, and timestamps.
              </li>
              <li>
                <b>Testimonials</b> you submit (your name, class and the
                review text). Reviews are hidden until manually approved.
              </li>
              <li>
                <b>Visit timestamps</b> when you load the dashboard so we can
                show recent activity to Khyati.
              </li>
              <li>
                <b>Anonymous analytics</b> (page views, country, device type)
                via Vercel Analytics. We do not see your IP address.
              </li>
            </ul>
          </Section>

          <Section title="How we use it">
            <ul>
              <li>To let you sign in and access notes you saved.</li>
              <li>To send chapter updates and class announcements by email.</li>
              <li>To answer your doubts and improve the chapters you read most.</li>
              <li>To prevent spam and abuse (rate-limiting, content checks).</li>
            </ul>
            <p>
              We never sell your data and we never share it with third-party
              advertisers.
            </p>
          </Section>

          <Section title="Where data is stored">
            <p>
              Account data is stored in Upstash (Redis, EU/US regions).
              Uploaded files are stored on Vercel Blob (a global CDN). Emails
              are sent through Brevo. All providers are GDPR-aligned.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use one essential cookie (<code>session</code>) to keep you
              signed in. No tracking or advertising cookies are used.
            </p>
          </Section>

          <Section title="Your choices">
            <ul>
              <li>
                <b>Access &amp; deletion:</b> email{" "}
                <a
                  href="mailto:chemistrybykk@gmail.com"
                  className="text-clay-accent font-semibold"
                >
                  chemistrybykk@gmail.com
                </a>{" "}
                from your registered email and we'll remove your account and
                attachments within 7 days.
              </li>
              <li>
                <b>Unsubscribe:</b> reply "unsubscribe" to any email and
                you'll be removed within 24 hours.
              </li>
              <li>
                <b>Children:</b> if you are under 13, please ask a parent or
                guardian to sign up on your behalf.
              </li>
            </ul>
          </Section>

          <Section title="Updates">
            <p>
              If we change this policy, we'll update the date above and, for
              significant changes, post a banner on the homepage.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Reach out at{" "}
              <a
                href="mailto:chemistrybykk@gmail.com"
                className="text-clay-accent font-semibold"
              >
                chemistrybykk@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="display text-xl font-extrabold text-clay-ink dark:text-white">
        {title}
      </h2>
      <div className="mt-3 text-clay-muted text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:underline">
        {children}
      </div>
    </section>
  );
}
