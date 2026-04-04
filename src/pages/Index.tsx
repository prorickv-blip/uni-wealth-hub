import { Link } from "react-router-dom";
import { Star, Shield, Users, Building, TrendingUp, DollarSign, CheckCircle, ArrowRight, BarChart3, Wallet, Menu, X, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const stats = [
  { label: "Total AUM", value: "$23.5M+", icon: BarChart3 },
  { label: "Daily Return", value: "5%", icon: TrendingUp },
  { label: "Success Rate", value: "98.7%", icon: CheckCircle },
  { label: "Active Investors", value: "102k+", icon: Users },
];

const steps = [
  { step: "01", title: "Invest", desc: "Start from just $10 in USDT TRC20", icon: Wallet },
  { step: "02", title: "We Manage", desc: "Experts manage your real estate portfolio", icon: Building },
  { step: "03", title: "Earn Daily", desc: "Receive 5% daily returns on deposits", icon: TrendingUp },
  { step: "04", title: "Withdraw", desc: "Withdraw your profits anytime", icon: DollarSign },
];

const faqs = [
  { q: "What is UNI?", a: "UNI is a premier real estate investment platform that allows you to earn daily returns by investing in high-value properties. Our expert team manages the portfolio while you earn passive income." },
  { q: "How much do I need to start?", a: "You can start investing with as little as $10 in USDT TRC20. There's no maximum limit on deposits." },
  { q: "How are profits calculated?", a: "You earn a fixed 5% daily return on your total deposits. Profits are calculated based on your deposit amount only — they do not compound." },
  { q: "Can I withdraw my deposit?", a: "Deposits are locked in the portfolio and cannot be withdrawn. However, you can withdraw your earned profits at any time with a minimum of $15." },
  { q: "How long does a withdrawal take?", a: "Withdrawal requests are reviewed and approved by our team, typically within 24 hours. Funds are sent to your USDT TRC20 wallet." },
  { q: "Is my investment safe?", a: "UNI is SEC compliant and fully insured. We use institutional-grade security to protect your investment and personal data." },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      toast.error("Please fill in all required fields"); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: inquiryName.trim(),
      email: inquiryEmail.trim(),
      subject: inquirySubject.trim(),
      message: inquiryMessage.trim(),
    });
    setSubmitting(false);
    if (error) toast.error("Failed to submit. Please try again.");
    else {
      toast.success("Your inquiry has been submitted!");
      setInquiryName(""); setInquiryEmail(""); setInquirySubject(""); setInquiryMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-sm">U</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">UNI</span>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/25" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
          <button className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-2 animate-fade-in">
            <Link to="/about" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link to="/blog" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <a href="#faq" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <a href="#contact" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/login">Log In</Link>
            </Button>
            <Button className="w-full rounded-full" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217,91%,60%,0.06),transparent_70%)]" />
        <div className="container text-center relative px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <Shield className="h-3.5 w-3.5 text-primary" />
            SEC Compliant & Fully Insured
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.08]">
            Your Gateway to{" "}
            <span className="text-gradient">Tangible Wealth</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Own a share of high-value real estate and earn a guaranteed{" "}
            <span className="text-primary font-semibold">5% daily return</span>.
          </p>
          <Button size="lg" className="text-base px-8 h-12 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all" asChild>
            <Link to="/signup">
              Invest Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 sm:py-16 border-y border-border bg-muted/30">
        <div className="container px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground font-medium tracking-widest uppercase mb-8">Trusted Worldwide</p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-6 sm:gap-12 lg:gap-16">
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-gold text-gold" />)}
              <span className="ml-2 text-sm font-semibold">5.0</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm"><Shield className="h-4 w-4 text-primary" /><span className="font-medium">SEC Compliant</span></div>
            <div className="flex items-center justify-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" /><span className="font-medium">102,000+ Investors</span></div>
            <div className="flex items-center justify-center gap-2 text-sm"><Building className="h-4 w-4 text-primary" /><span className="font-medium">Real Estate in Beijing</span></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-muted/30 border-y border-border">
        <div className="container px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto">Start earning in minutes with our simple 4-step process.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative p-6 rounded-2xl bg-card border border-border group hover:border-primary/40 hover:shadow-lg transition-all">
                <span className="text-5xl font-display font-bold text-muted/20 absolute top-4 right-4">{s.step}</span>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us CTA */}
      <section className="py-16 sm:py-24 scroll-mt-20">
        <div className="container px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">About Us</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Learn about our mission, team, and what makes UNI the trusted choice for real estate investment.</p>
          <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
            <Link to="/about">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 bg-muted/30 border-y border-border scroll-mt-20">
        <div className="container px-4 sm:px-6 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-center mb-10">Everything you need to know about UNI.</p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Collapsible key={i}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl bg-card border border-border text-left hover:border-primary/30 transition-colors group">
                  <span className="font-medium text-sm pr-4">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 group-data-[state=open]:rotate-180 transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Inquiry */}
      <section id="contact" className="py-16 sm:py-24 scroll-mt-20">
        <div className="container px-4 sm:px-6 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">Get In Touch</h2>
          <p className="text-muted-foreground text-center mb-10">Have a question? We'd love to hear from you.</p>
          <form onSubmit={handleInquiry} className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Name *</Label>
                <Input value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} placeholder="Your name" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email *</Label>
                <Input type="email" value={inquiryEmail} onChange={(e) => setInquiryEmail(e.target.value)} placeholder="you@example.com" required className="h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Subject</Label>
              <Input value={inquirySubject} onChange={(e) => setInquirySubject(e.target.value)} placeholder="What's this about?" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Message *</Label>
              <Textarea value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} placeholder="Your message..." required rows={4} />
            </div>
            <Button type="submit" disabled={submitting} className="rounded-full px-6 h-10">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-muted/30 border-t border-border">
        <div className="container px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto p-10 sm:p-14 rounded-3xl gradient-primary text-primary-foreground shadow-2xl shadow-primary/20">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="opacity-90 mb-8 text-lg">Join 102,000+ investors earning daily returns from premium real estate.</p>
            <Button size="lg" variant="secondary" className="rounded-full px-8 text-base shadow-lg" asChild>
              <Link to="/signup">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
