import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, CheckCircle, Globe, Shield, Users, Menu, X } from "lucide-react";
import Footer from "@/components/Footer";
import { useState } from "react";

const leadership = [
  { name: "Alexander Wright", role: "Founder & CEO", from: "England" },
  { name: "Isla Cloutier", role: "Chief Financial Officer", from: "Canada" },
  { name: "Feng Shao", role: "Chief Operations Officer", from: "China" },
  { name: "Ade Bukit", role: "Chief Marketing Officer", from: "Indonesia" },
];

const globalTeam = [
  { name: "Bo Qin", role: "HQ & Chinese Local Office Manager", from: "China" },
  { name: "Hua Chee", role: "Investment Analyst — Hotels", from: "China" },
  { name: "Mei Xiao", role: "Investment Analyst — Apartments", from: "China" },
  { name: "Jia Chew", role: "Legal & Compliance Officer", from: "China" },
  { name: "Sal Az Faden", role: "Local Office Manager", from: "Indonesia" },
  { name: "Ad Gajah", role: "Investment Analyst — Real Estate", from: "Indonesia" },
  { name: "Peter Obor", role: "Local Office Manager", from: "Uganda" },
  { name: "Rahman Kizza", role: "Investment Analyst — Hotels", from: "Uganda" },
];

const operations = [
  { name: "Yize Yu", role: "Chief of Investor Relations", from: "China" },
  { name: "Zhi Ming Dai", role: "Monitoring & Transaction Handling", from: "China" },
  { name: "Kule Derrick", role: "Customer Support Agent", from: "Uganda" },
  { name: "Gang Wen", role: "IT & Systems Administrator", from: "China" },
  { name: "An Wu", role: "Financial Accountant", from: "China" },
  { name: "Zya Azzikro", role: "Financial Accountant", from: "Indonesia" },
];

const marketing = [
  { name: "Bimo Lais", role: "Digital Marketing Specialist", from: "Indonesia" },
  { name: "Blake Wilson", role: "Content Creator/Strategist", from: "England" },
];

const pillars = [
  { icon: CheckCircle, title: "Unrivaled Returns", desc: "5% daily return provides a powerful engine for wealth accumulation." },
  { icon: Users, title: "Accessibility & Inclusion", desc: "Low entry point of $10, removing traditional barriers of high capital." },
  { icon: Building, title: "Tangible Security", desc: "Backed by real, physical assets — brick and mortar security." },
  { icon: Shield, title: "Proven Expertise", desc: "Founded in 2016 with deep understanding of real estate markets." },
  { icon: Globe, title: "Transparency & Trust", desc: "Full transparency ensuring you're always connected to your assets." },
];

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const TeamGrid = ({ members }: { members: typeof leadership }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {members.map((m) => (
        <div key={m.name} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary font-display font-bold text-sm">{m.name.split(" ").map(n => n[0]).join("")}</span>
          </div>
          <p className="font-semibold text-sm">{m.name}</p>
          <p className="text-xs text-muted-foreground">{m.role}</p>
          <p className="text-[11px] text-primary mt-1">{m.from}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-sm">U</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">UNI</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/about" className="text-foreground font-medium">About</Link>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Log In</Link></Button>
            <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/25" asChild><Link to="/signup">Get Started</Link></Button>
          </div>
          <button className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-2 animate-fade-in">
            <Link to="/" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/blog" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}><Link to="/login">Log In</Link></Button>
            <Button className="w-full rounded-full" asChild onClick={() => setMobileMenuOpen(false)}><Link to="/signup">Get Started</Link></Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-20 gradient-hero">
        <div className="container px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            About <span className="text-gradient">UNI</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Your Gateway to Tangible Real Estate Wealth. Founded in 2016 in Beijing, we are redefining the landscape of real estate investment by making it accessible, profitable, and transparent for everyone.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 sm:py-24 border-b border-border">
        <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be the most trusted and innovative platform for real estate investment, empowering individuals to build a legacy of wealth through fractional ownership of prime properties.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To acquire and manage a curated portfolio of high-performing real estate assets, leveraging our expertise and a revolutionary investment model to deliver exceptional, consistent returns to our global community of investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Model */}
      <section className="py-16 sm:py-24 bg-muted/30 border-b border-border">
        <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">The UNI Investment Model</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Your Room, Your Asset — we've simplified the path to property ownership.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-display font-bold text-xl">1</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">You Invest</h3>
              <p className="text-sm text-muted-foreground">Start with a minimum of just $10. No upper limit on your investment.</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-display font-bold text-xl">2</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">We Acquire</h3>
              <p className="text-sm text-muted-foreground">Capital is used to acquire premium real estate in strategic locations like Beijing.</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border text-center">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-display font-bold text-xl">3</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">You Earn</h3>
              <p className="text-sm text-muted-foreground">Receive a guaranteed 5% daily return — consistent and predictable growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 sm:py-24 border-b border-border">
        <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">Why UNI?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <p.icon className="h-7 w-7 text-primary mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage */}
      <section className="py-16 sm:py-24 bg-muted/30 border-b border-border">
        <div className="container px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">Our Heritage</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Since our founding in Beijing in 2016, UNI has built a reputation for integrity and performance. We have grown from a bold idea into a powerful force in investment, all while staying true to our core principle: providing a simple, secure, and profitable way for people to own a piece of the world's most valuable asset class. We are not just an investment company; we are a partner in your financial future.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">The People Behind UNI</h2>

          <div className="space-y-12">
            <div>
              <h3 className="font-display font-semibold text-xl mb-6 text-center">Leadership & Management</h3>
              <TeamGrid members={leadership} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl mb-6 text-center">Global Investment Teams</h3>
              <TeamGrid members={globalTeam} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl mb-6 text-center">Central Operations & Support</h3>
              <TeamGrid members={operations} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl mb-6 text-center">Marketing & Business Development</h3>
              <TeamGrid members={marketing} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-muted/30 border-t border-border">
        <div className="container px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto p-10 sm:p-14 rounded-3xl gradient-primary text-primary-foreground shadow-2xl shadow-primary/20">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to Invest?</h2>
            <p className="opacity-90 mb-8 text-lg">Join our global community of investors building wealth through real estate.</p>
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
