import { Link } from "react-router-dom";
import { Star, Shield, Users, Building, TrendingUp, DollarSign, CheckCircle, ArrowRight, BarChart3, Wallet, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen gradient-dark text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xs sm:text-sm">U</span>
            </div>
            <span className="font-display font-bold text-lg sm:text-xl">UNI</span>
          </div>
          <p className="hidden lg:block text-xs text-muted-foreground font-medium tracking-wider uppercase">
            #1 Real Estate Investment Platform
          </p>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
          {/* Mobile hamburger */}
          <button className="sm:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/login">Log In</Link>
            </Button>
            <Button className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-14 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217,91%,60%,0.08),transparent_60%)]" />
        <div className="container text-center relative px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
            <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
            SEC Compliant & Fully Insured
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 max-w-4xl mx-auto leading-[1.1]">
            Your Gateway to{" "}
            <span className="text-gradient">Tangible Wealth</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Own a share of high-value real estate and earn a guaranteed{" "}
            <span className="text-primary font-semibold">5% daily return</span>.
          </p>
          <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 animate-pulse-glow" asChild>
            <Link to="/signup">
              Invest Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Trust */}
      <section className="py-10 sm:py-16 border-y border-border/30 bg-card/30">
        <div className="container px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-muted-foreground font-medium tracking-wider uppercase mb-6 sm:mb-8">
            Trusted Worldwide
          </p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-16">
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-gold text-gold" />
              ))}
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium">5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span>SEC Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span>102,000+ Investors</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span>Real Estate in Beijing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 sm:py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border shadow-sm">
                <s.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-3" />
                <p className="font-display text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 sm:py-20 bg-card/30 border-y border-border/30">
        <div className="container px-4 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-10 sm:mb-14 max-w-lg mx-auto text-sm sm:text-base">
            Start earning in minutes with our simple 4-step process.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-background border border-border/50 group hover:border-primary/50 transition-colors">
                <span className="text-4xl sm:text-5xl font-display font-bold text-muted/30 absolute top-3 sm:top-4 right-3 sm:right-4">{s.step}</span>
                <s.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
                <h3 className="font-display font-semibold text-base sm:text-lg mb-1 sm:mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20">
        <div className="container px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-2xl sm:rounded-3xl gradient-primary text-primary-foreground">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Start Earning?</h2>
            <p className="opacity-90 mb-6 sm:mb-8 text-sm sm:text-base">Join 102,000+ investors earning daily returns from premium real estate.</p>
            <Button size="lg" variant="secondary" className="text-sm sm:text-base px-6 sm:px-8" asChild>
              <Link to="/signup">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-border/30">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-4 sm:px-6">
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
