import { Link } from "react-router-dom";
import { Star, Shield, Users, Building, TrendingUp, DollarSign, CheckCircle, ArrowRight, BarChart3, Wallet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">U</span>
            </div>
            <span className="font-display font-bold text-xl">UNI</span>
          </div>
          <p className="hidden md:block text-xs text-muted-foreground font-medium tracking-wider uppercase">
            #1 Real Estate Investment Platform
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <Shield className="h-3.5 w-3.5 text-primary" />
            SEC Compliant & Fully Insured
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
            Your Gateway to{" "}
            <span className="text-gradient">Tangible Wealth</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Own a share of high-value real estate and earn a guaranteed{" "}
            <span className="text-primary font-semibold">5% daily return</span>.
          </p>
          <Button size="lg" className="text-base px-8 h-12 animate-pulse-glow" asChild>
            <Link to="/signup">
              Invest Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 border-y bg-card/50">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground font-medium tracking-wider uppercase mb-8">
            Trusted Worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold text-gold" />
              ))}
              <span className="ml-2 text-sm font-medium">5.0 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>SEC Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>102,000+ Investors</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-primary" />
              <span>Real Estate in Beijing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 rounded-2xl bg-card border shadow-sm">
                <s.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl font-bold mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50 border-y">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto">
            Start earning in minutes with our simple 4-step process.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative p-6 rounded-2xl bg-background border group hover:border-primary/50 transition-colors">
                <span className="text-5xl font-display font-bold text-muted/50 absolute top-4 right-4">{s.step}</span>
                <s.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto p-12 rounded-3xl gradient-primary text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="opacity-90 mb-8">Join 102,000+ investors earning daily returns from premium real estate.</p>
            <Button size="lg" variant="secondary" className="text-base px-8" asChild>
              <Link to="/signup">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-[10px]">U</span>
            </div>
            <span className="font-display font-semibold text-foreground">UNI</span>
          </div>
          <p>© 2026 UNI Investment Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
