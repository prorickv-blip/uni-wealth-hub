import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8" asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <span className="font-display font-bold text-lg">Terms & Conditions</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-24 pb-16 container px-4 sm:px-6 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">Terms & Conditions</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm"><strong>Last Updated:</strong> April 5, 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using the UNI Investment Platform ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you must not use the Platform.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">2. Eligibility</h2>
            <p>You must be at least 18 years old and have the legal capacity to enter into binding contracts. By registering, you confirm that you meet these requirements.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">3. Investment Terms</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>The minimum investment is $10 (USD) or UGX 38,000 (for Airtel Money in Uganda).</li>
              <li>Deposits are locked in the investment portfolio and <strong>cannot be withdrawn</strong>.</li>
              <li>You earn a 5% daily return calculated on your total deposit amount.</li>
              <li>Returns are non-compounding — profits are calculated on deposits only.</li>
              <li>Profits can be withdrawn at any time with a minimum of $15.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">4. Payment Methods</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>USDT (TRC20):</strong> Available worldwide. You must send via the TRON network only. Sending via the wrong network may result in permanent loss of funds.</li>
              <li><strong>Airtel Money:</strong> Available only for users in Uganda. Minimum: UGX 38,000. Maximum: UGX 3,000,000.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">5. Withdrawals</h2>
            <p>Withdrawal requests are reviewed by our team and typically processed within 24 hours. Funds are sent to your specified USDT TRC20 wallet address. UNI is not responsible for incorrect wallet addresses provided by the user.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">6. Account Security</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. UNI reserves the right to lock or flag accounts that exhibit suspicious activity, abnormal login patterns, or potential fraud.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">7. Referral Program</h2>
            <p>Users may invite others using their unique referral link. Abuse of the referral system, including self-referrals or fraudulent activity, may result in account suspension.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">8. Risk Disclaimer</h2>
            <p>All investments carry risk. While UNI invests in tangible real estate assets, past performance does not guarantee future results. You should only invest funds you can afford to commit long-term.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">9. Privacy Policy</h2>
            <p>We collect personal information (name, email, IP address) to provide and secure our services. Your data is stored securely and is never sold to third parties. We may use your email for platform notifications and updates.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">10. Termination</h2>
            <p>UNI reserves the right to suspend or terminate any account at its sole discretion, including but not limited to cases of fraud, policy violations, or regulatory compliance requirements.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">11. Modifications</h2>
            <p>UNI may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">12. Contact</h2>
            <p>For questions about these Terms, please use the <Link to="/#contact" className="text-primary hover:underline">Contact Form</Link> on our website or reach out through the in-app support chat.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
