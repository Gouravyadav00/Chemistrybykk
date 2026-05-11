import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules and expectations for using ChemistryByKK's learning portal.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-clay-muted text-sm mt-2">
            Last updated: May 2026
          </p>

          <Section title="Acceptance">
            <p>
              By creating an account or using ChemistryByKK, you agree to
              these terms. If you do not agree, please don't use the service.
            </p>
          </Section>

          <Section title="Who can use it">
            <p>
              ChemistryByKK is intended for Class 9–12 students and their
              guardians. If you are under 13, you must use the service with
              parental permission.
            </p>
          </Section>

          <Section title="Your account">
            <ul>
              <li>Keep your password private. You are responsible for activity on your account.</li>
              <li>One account per student. Sharing logins is not allowed.</li>
              <li>Provide accurate information when signing up.</li>
            </ul>
          </Section>

          <Section title="Content you upload (doubts, testimonials)">
            <ul>
              <li>Post only academic questions and constructive reviews.</li>
              <li>
                Do not upload anything offensive, illegal, or that infringes
                someone else's copyright.
              </li>
              <li>
                We may remove content that violates these rules without notice.
              </li>
              <li>
                Testimonials are reviewed manually before going live. We may
                edit them for clarity or reject them at our discretion.
              </li>
            </ul>
          </Section>

          <Section title="Content we provide (notes, cheatsheets, past papers, quizzes)">
            <ul>
              <li>
                All notes, cheatsheets, roadmaps, past papers and quiz
                questions on ChemistryByKK are © Khyati Kaushik. You may use
                them for your own study.
              </li>
              <li>
                Do not redistribute, republish or sell our material without
                written permission.
              </li>
              <li>
                We try our best to keep content accurate and aligned with the
                NCERT syllabus, but the service is provided "as-is" and we
                make no guarantees about exam outcomes.
              </li>
            </ul>
          </Section>

          <Section title="Service availability">
            <p>
              We aim for high uptime but do not guarantee continuous
              availability. Features may change or be removed as we improve
              the site.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              You can delete your account at any time by emailing{" "}
              <a
                href="mailto:chemistrybykk@gmail.com"
                className="text-clay-accent font-semibold"
              >
                chemistrybykk@gmail.com
              </a>
              . We may suspend accounts that violate these terms.
            </p>
          </Section>

          <Section title="Liability">
            <p>
              To the maximum extent allowed by law, ChemistryByKK is not
              liable for any indirect or consequential damages arising from
              your use of the service.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these terms. Material changes will be announced on
              the homepage; continued use means you accept the new terms.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These terms are governed by the laws of India. Any disputes will
              be resolved in the courts of Delhi.
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
