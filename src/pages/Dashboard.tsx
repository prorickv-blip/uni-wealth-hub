import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Copy, LogOut, User, History, Share2, ShieldCheck, DollarSign, Activity, MessageSquare, Users as UsersIcon, Newspaper, AlertTriangle, Phone, Globe } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import SupportBubble from "@/components/SupportBubble";
import NotificationBell from "@/components/NotificationBell";
import UpdatesFeed from "@/components/UpdatesFeed";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const platform = usePlatformSettings();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [profitLogs, setProfitLogs] = useState<any[]>([]);

  const [paymentMethod, setPaymentMethod] = useState<"usdt_trc20" | "airtel_money">("usdt_trc20");
  const [currency, setCurrency] = useState<"USD" | "UGX">("USD");
  const [depositAmount, setDepositAmount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"usdt_trc20" | "airtel_money">("usdt_trc20");
  const [airtelPhone, setAirtelPhone] = useState("");
  const [airtelName, setAirtelName] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const [editName, setEditName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!location.loading) {
      setCurrency(location.currency);
      if (location.isUganda) setPaymentMethod("usdt_trc20");
    }
  }, [location.loading, location.currency, location.isUganda]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Process referral code after login
  useEffect(() => {
    if (!user || !profile) return;
    const refCode = localStorage.getItem("referral_code");
    if (refCode && !profile.referred_by) {
      (async () => {
        // Find the referrer
        const { data: referrer } = await supabase.from("profiles").select("user_id").eq("referral_code", refCode).maybeSingle();
        if (referrer && referrer.user_id !== user.id) {
          await supabase.from("profiles").update({ referred_by: refCode }).eq("user_id", user.id);
          await supabase.from("referrals").insert({
            referrer_id: referrer.user_id,
            referred_id: user.id,
            referral_code: refCode,
            status: "pending",
          });
          localStorage.removeItem("referral_code");
        }
      })();
    }
  }, [user, profile]);

  const fetchData = async () => {
    const [{ data: p }, { data: d }, { data: w }, { data: pl }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("deposit_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("withdrawal_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("profit_logs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    ]);
    if (p) { setProfile(p); setEditName(p.name); }
    setDeposits(d || []);
    setWithdrawals(w || []);
    setProfitLogs(pl || []);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (paymentMethod === "usdt_trc20") {
      if (isNaN(amt) || amt < 10) { toast.error("Minimum deposit is $10"); return; }
    } else {
      if (isNaN(amt) || amt < 38000) { toast.error("Minimum Airtel deposit is UGX 38,000"); return; }
      if (amt > 3000000) { toast.error("Maximum Airtel deposit is UGX 3,000,000"); return; }
    }
    if (!screenshot) { toast.error("Please upload a screenshot"); return; }
    setSubmittingDeposit(true);
    const ext = screenshot.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("deposit-screenshots").upload(path, screenshot);
    if (upErr) { toast.error("Failed to upload screenshot"); setSubmittingDeposit(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("deposit-screenshots").getPublicUrl(path);
    const { error } = await supabase.from("deposit_requests").insert({
      user_id: user!.id,
      amount: amt,
      screenshot_url: publicUrl,
      status: "pending",
      payment_method: paymentMethod,
      currency: paymentMethod === "airtel_money" ? "UGX" : currency,
    });
    setSubmittingDeposit(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Deposit submitted for approval!");
      setDepositAmount(""); setScreenshot(null);
      // Create a notification for the user
      await supabase.from("notifications").insert({
        title: "Deposit Submitted",
        message: `Your ${paymentMethod === "airtel_money" ? "Airtel Money" : "USDT TRC20"} deposit of ${paymentMethod === "airtel_money" ? `UGX ${amt.toLocaleString()}` : `$${amt.toFixed(2)}`} has been submitted and is pending approval.`,
        target: "specific",
        target_user_id: user!.id,
      });
      fetchData();
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 15) { toast.error("Minimum withdrawal is $15"); return; }
    if (!profile || amt > profile.profits) { toast.error("Insufficient profits"); return; }
    if (withdrawMethod === "usdt_trc20" && !walletAddr.trim()) { toast.error("Enter wallet address"); return; }
    if (withdrawMethod === "airtel_money" && (!airtelPhone.trim() || !airtelName.trim())) { toast.error("Enter your Airtel number and name"); return; }
    setSubmittingWithdraw(true);
    const address = withdrawMethod === "airtel_money" ? `Airtel: ${airtelPhone.trim()} (${airtelName.trim()})` : walletAddr.trim();
    const { error } = await supabase.from("withdrawal_requests").insert({ user_id: user!.id, amount: amt, wallet_address: address, status: "pending" });
    setSubmittingWithdraw(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Withdrawal submitted! Please allow 24 hours for processing.");
      setWithdrawAmount(""); setWalletAddr(""); setAirtelPhone(""); setAirtelName("");
      await supabase.from("notifications").insert({
        title: "Withdrawal Submitted",
        message: `Your ${withdrawMethod === "airtel_money" ? "Airtel Money" : "USDT"} withdrawal of $${amt.toFixed(2)} has been submitted. Please allow up to 24 hours for verification.`,
        target: "specific",
        target_user_id: user!.id,
      });
      fetchData();
    }
  };

  const handleProfileUpdate = async () => {
    let avatarUrl = profile?.avatar_url;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${user!.id}/avatar.${ext}`;
      await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrl;
    }
    const { error } = await supabase.from("profiles").update({ name: editName, avatar_url: avatarUrl }).eq("user_id", user!.id);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); fetchData(); }
  };

  const copyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${profile.referral_code}`);
      toast.success("Referral link copied!");
    }
  };

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const statusColor = (s: string) => s === "approved" ? "default" as const : s === "rejected" ? "destructive" as const : "secondary" as const;
  const dailyReturn = Number(profile.deposits) * 0.05;
  const totalBalance = Number(profile.deposits) + Number(profile.profits);

  const WALLET_ADDRESS = platform.wallet_address;
  const AIRTEL_MERCHANT_ID = platform.airtel_merchant_id;
  const AIRTEL_DIAL_CODE = platform.airtel_dial_code;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-lg sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            {platform.icon_url ? (
              <img src={platform.icon_url} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xs">U</span>
              </div>
            )}
            <span className="font-display font-bold text-base">{platform.platform_name}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell />
            {isAdmin && (
              <Button variant="outline" size="sm" className="rounded-full text-xs h-8" asChild>
                <Link to="/admin"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Admin</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6 px-4 sm:px-6 max-w-6xl">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {profile.name || "Investor"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's your portfolio overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Total Balance</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-primary" /></div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold">${totalBalance.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Combined portfolio value</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Deposits</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Wallet className="h-4 w-4 text-primary" /></div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold">${Number(profile.deposits).toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Locked in portfolio</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Profits</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-emerald-600">${Number(profile.profits).toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Available to withdraw</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Daily Return</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Activity className="h-4 w-4 text-amber-500" /></div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold">${dailyReturn.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">5% of your deposits</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposit" className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-7 h-auto p-1 bg-muted/50">
              <TabsTrigger value="deposit" className="text-xs py-2 whitespace-nowrap"><ArrowDownToLine className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Deposit</span></TabsTrigger>
              <TabsTrigger value="withdraw" className="text-xs py-2 whitespace-nowrap"><ArrowUpFromLine className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Withdraw</span></TabsTrigger>
              <TabsTrigger value="history" className="text-xs py-2 whitespace-nowrap"><History className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">History</span></TabsTrigger>
              <TabsTrigger value="updates" className="text-xs py-2 whitespace-nowrap"><Newspaper className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Updates</span></TabsTrigger>
              <TabsTrigger value="chat" className="text-xs py-2 whitespace-nowrap"><MessageSquare className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Chat</span></TabsTrigger>
              <TabsTrigger value="profile" className="text-xs py-2 whitespace-nowrap"><User className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Profile</span></TabsTrigger>
              <TabsTrigger value="referral" className="text-xs py-2 whitespace-nowrap"><Share2 className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Invite</span></TabsTrigger>
            </TabsList>
          </div>

          {/* Deposit Tab */}
          <TabsContent value="deposit">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Make a Deposit</CardTitle>
                <p className="text-sm text-muted-foreground">Choose your payment method and submit proof for approval.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Payment Method</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => { setPaymentMethod("usdt_trc20"); setCurrency("USD"); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === "usdt_trc20" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="font-semibold text-sm">USDT (TRC20)</p>
                          <p className="text-xs text-muted-foreground">Crypto — Available worldwide</p>
                        </div>
                      </div>
                    </button>
                    <button type="button" onClick={() => { setPaymentMethod("airtel_money"); setCurrency("UGX"); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === "airtel_money" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Phone className="h-5 w-5 text-destructive" /></div>
                        <div>
                          <p className="font-semibold text-sm">Airtel Money</p>
                          <p className="text-xs text-muted-foreground">Uganda only — UGX</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === "usdt_trc20" && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Currency:</Label>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      <button type="button" onClick={() => setCurrency("USD")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${currency === "USD" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>USD</button>
                      <button type="button" onClick={() => setCurrency("UGX")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${currency === "UGX" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>UGX</button>
                    </div>
                  </div>
                )}

                {/* USDT TRC20 Flow */}
                {paymentMethod === "usdt_trc20" && (
                  <form onSubmit={handleDeposit} className="space-y-4 max-w-lg">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                          <strong>Warning:</strong> You must send using USDT TRON Network (TRC20) only. Sending via the wrong network may result in permanent loss of funds.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Amount ({currency}, min {currency === "USD" ? "$10" : "UGX 38,000"})</Label>
                      <Input type="number" min={currency === "USD" ? "10" : "38000"} step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder={currency === "USD" ? "10.00" : "38000"} required className="h-10" />
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Send USDT TRC20 to this address:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background p-2.5 rounded-lg flex-1 break-all border border-border font-mono">{WALLET_ADDRESS}</code>
                        <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(WALLET_ADDRESS); toast.success("Copied!"); }}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                      <p className="text-xs font-semibold">Steps:</p>
                      <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                        <li>Copy the wallet address above</li>
                        <li>Open your crypto wallet (e.g., Binance, Trust Wallet)</li>
                        <li>Select Send → Paste the wallet address</li>
                        <li>Ensure network = <strong>TRC20</strong></li>
                        <li>Enter amount and confirm transaction</li>
                        <li>Take a screenshot of the full transaction (must include time)</li>
                        <li>Upload the screenshot below and submit</li>
                      </ol>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                      <p className="text-xs font-semibold">📹 How to Transfer USDT from Binance</p>
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <iframe src="https://www.youtube.com/embed/SZZoZ0zmk8w" className="w-full h-full" allowFullScreen title="USDT Transfer Guide" />
                      </div>
                      <p className="text-xs text-muted-foreground">Need more help? Talk to us, we reply immediately.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Payment Screenshot</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} required className="h-10" />
                    </div>
                    <Button type="submit" disabled={submittingDeposit} className="rounded-full px-6 h-10">
                      {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                    </Button>
                  </form>
                )}

                {/* Airtel Money Flow */}
                {paymentMethod === "airtel_money" && (
                  <form onSubmit={handleDeposit} className="space-y-4 max-w-lg">
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                          <p><strong>Minimum deposit:</strong> UGX 38,000</p>
                          <p><strong>Maximum deposit:</strong> UGX 3,000,000</p>
                          <p>Only available for users in Uganda.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Amount (UGX, min 38,000 — max 3,000,000)</Label>
                      <Input type="number" min="38000" max="3000000" step="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="38000" required className="h-10" />
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Merchant ID:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg bg-background p-2.5 rounded-lg flex-1 text-center border border-border font-mono font-bold">{AIRTEL_MERCHANT_ID}</code>
                        <Button type="button" variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(AIRTEL_MERCHANT_ID); toast.success("Merchant ID copied!"); }}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                      <p className="text-xs font-semibold">Steps:</p>
                      <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                        <li>Copy Merchant ID: <strong>{AIRTEL_MERCHANT_ID}</strong></li>
                        <li>Dial <strong>{AIRTEL_DIAL_CODE}</strong> on your phone</li>
                        <li>Enter Merchant ID</li>
                        <li>Enter amount (minimum UGX 38,000)</li>
                        <li>Enter a reference (e.g., your name)</li>
                        <li>Confirm using your Airtel Money PIN</li>
                        <li>Take a screenshot including transaction ID</li>
                        <li>Upload the screenshot below and submit</li>
                      </ol>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground">Need more help? Talk to us, we reply immediately.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Payment Screenshot</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} required className="h-10" />
                    </div>
                    <Button type="submit" disabled={submittingDeposit} className="rounded-full px-6 h-10">
                      {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Withdraw Profits</CardTitle>
                <p className="text-sm text-muted-foreground">Available: <span className="text-emerald-600 font-semibold">${Number(profile.profits).toFixed(2)}</span></p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Withdrawal Method</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => setWithdrawMethod("usdt_trc20")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${withdrawMethod === "usdt_trc20" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="font-semibold text-sm">USDT (TRC20)</p>
                          <p className="text-xs text-muted-foreground">Crypto withdrawal</p>
                        </div>
                      </div>
                    </button>
                    <button type="button" onClick={() => setWithdrawMethod("airtel_money")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${withdrawMethod === "airtel_money" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Phone className="h-5 w-5 text-destructive" /></div>
                        <div>
                          <p className="font-semibold text-sm">Airtel Money</p>
                          <p className="text-xs text-muted-foreground">Uganda only — UGX</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4 max-w-lg">
                  {withdrawMethod === "usdt_trc20" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">USDT TRC20 Wallet Address</Label>
                      <Input value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} placeholder="T..." className="h-10" />
                    </div>
                  )}
                  {withdrawMethod === "airtel_money" && (
                    <>
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                            <p>Withdrawals are processed within <strong>24 hours</strong>.</p>
                            <p>We verify and send the money to your Airtel number.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Full Name (as on Airtel)</Label>
                        <Input value={airtelName} onChange={(e) => setAirtelName(e.target.value)} placeholder="John Doe" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Airtel Money Phone Number</Label>
                        <Input value={airtelPhone} onChange={(e) => setAirtelPhone(e.target.value)} placeholder="07XXXXXXXX" className="h-10" />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Amount (min $15)</Label>
                    <Input type="number" min="15" step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="15.00" required className="h-10" />
                  </div>
                  <Button type="submit" disabled={submittingWithdraw} className="rounded-full px-6 h-10">
                    {submittingWithdraw ? "Submitting..." : "Submit Withdrawal"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowDownToLine className="h-4 w-4 text-primary" /> Deposit History</CardTitle></CardHeader>
              <CardContent>
                {deposits.length === 0 ? <p className="text-sm text-muted-foreground py-4">No deposits yet.</p> : (
                  <div className="divide-y divide-border">
                    {deposits.map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-semibold text-sm">{d.currency === "UGX" ? `UGX ${Number(d.amount).toLocaleString()}` : `$${Number(d.amount).toFixed(2)}`}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()} • {d.payment_method === "airtel_money" ? "Airtel Money" : "USDT TRC20"}</p>
                        </div>
                        <Badge variant={statusColor(d.status)} className="text-[10px]">{d.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowUpFromLine className="h-4 w-4 text-primary" /> Withdrawal History</CardTitle></CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? <p className="text-sm text-muted-foreground py-4">No withdrawals yet.</p> : (
                  <div className="divide-y divide-border">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-semibold text-sm">${Number(w.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground font-mono">{w.wallet_address.slice(0, 12)}...</p>
                        </div>
                        <Badge variant={statusColor(w.status)} className="text-[10px]">{w.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Profit Distributions</CardTitle></CardHeader>
              <CardContent>
                {profitLogs.length === 0 ? <p className="text-sm text-muted-foreground py-4">No profit distributions yet.</p> : (
                  <div className="divide-y divide-border">
                    {profitLogs.map((pl) => (
                      <div key={pl.id} className="flex items-center justify-between py-3">
                        <p className="font-semibold text-sm text-emerald-600">+${Number(pl.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(pl.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="font-display text-lg flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary" /> Platform Updates</CardTitle></CardHeader>
              <CardContent><UpdatesFeed /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="overflow-hidden">
              <div className="h-[500px]">
                <ChatPanel channel="group" title="Investors Community" icon={<UsersIcon className="h-4 w-4 text-primary" />} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-4"><CardTitle className="font-display text-lg">Edit Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                    {profile.avatar_url ? <img src={profile.avatar_url} className="h-16 w-16 object-cover" alt="avatar" /> : <User className="h-7 w-7 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold">{profile.name || "No name set"}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Profile Picture</Label><Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="h-10" /></div>
                <Button onClick={handleProfileUpdate} className="rounded-full px-6 h-10">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Invite Friends</CardTitle>
                <p className="text-sm text-muted-foreground">Share your unique referral link and grow the community.</p>
              </CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/signup?ref=${profile.referral_code}`} className="h-10 font-mono text-xs" />
                  <Button variant="outline" onClick={copyReferral}><Copy className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <SupportBubble />
    </div>
  );
}
