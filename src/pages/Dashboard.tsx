import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Copy, LogOut, User, History, Share2, ShieldCheck, DollarSign, Activity, MessageSquare, Users as UsersIcon } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import SupportBubble from "@/components/SupportBubble";

const WALLET_ADDRESS = "TH7aGzdMyxViEjo7nk7aRdkr6U171r8m12";

export default function Dashboard() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [profitLogs, setProfitLogs] = useState<any[]>([]);

  const [depositAmount, setDepositAmount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const [editName, setEditName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

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
    if (isNaN(amt) || amt < 10) { toast.error("Minimum deposit is $10"); return; }
    if (!screenshot) { toast.error("Please upload a screenshot"); return; }
    setSubmittingDeposit(true);
    const ext = screenshot.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("deposit-screenshots").upload(path, screenshot);
    if (upErr) { toast.error("Failed to upload screenshot"); setSubmittingDeposit(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("deposit-screenshots").getPublicUrl(path);
    const { error } = await supabase.from("deposit_requests").insert({ user_id: user!.id, amount: amt, screenshot_url: publicUrl, status: "pending" });
    setSubmittingDeposit(false);
    if (error) toast.error(error.message);
    else { toast.success("Deposit submitted for approval!"); setDepositAmount(""); setScreenshot(null); fetchData(); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 15) { toast.error("Minimum withdrawal is $15"); return; }
    if (!profile || amt > profile.profits) { toast.error("Insufficient profits"); return; }
    if (!walletAddr.trim()) { toast.error("Enter wallet address"); return; }
    setSubmittingWithdraw(true);
    const { error } = await supabase.from("withdrawal_requests").insert({ user_id: user!.id, amount: amt, wallet_address: walletAddr.trim(), status: "pending" });
    setSubmittingWithdraw(false);
    if (error) toast.error(error.message);
    else { toast.success("Withdrawal submitted!"); setWithdrawAmount(""); setWalletAddr(""); fetchData(); }
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

  const statusColor = (s: string) => s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary";
  const dailyReturn = Number(profile.deposits) * 0.05;
  const totalBalance = Number(profile.deposits) + Number(profile.profits);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-lg sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xs">U</span>
            </div>
            <span className="font-display font-bold text-base">UNI</span>
          </Link>
          <div className="flex items-center gap-2">
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
        {/* Welcome */}
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {profile.name || "Investor"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's your portfolio overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Total Balance</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold">${totalBalance.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Combined portfolio value</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Deposits</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold">${Number(profile.deposits).toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Locked in portfolio</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Profits</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold text-emerald-600">${Number(profile.profits).toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Available to withdraw</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Daily Return</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-display font-bold">${dailyReturn.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">5% of your deposits</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="deposit" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full h-auto p-1 bg-muted/50">
            <TabsTrigger value="deposit" className="text-xs py-2 data-[state=active]:bg-background"><ArrowDownToLine className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Deposit</span></TabsTrigger>
            <TabsTrigger value="withdraw" className="text-xs py-2 data-[state=active]:bg-background"><ArrowUpFromLine className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Withdraw</span></TabsTrigger>
            <TabsTrigger value="history" className="text-xs py-2 data-[state=active]:bg-background"><History className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">History</span></TabsTrigger>
            <TabsTrigger value="chat" className="text-xs py-2 data-[state=active]:bg-background"><MessageSquare className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Chat</span></TabsTrigger>
            <TabsTrigger value="profile" className="text-xs py-2 data-[state=active]:bg-background"><User className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Profile</span></TabsTrigger>
            <TabsTrigger value="referral" className="text-xs py-2 data-[state=active]:bg-background"><Share2 className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Invite</span></TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Make a Deposit</CardTitle>
                <p className="text-sm text-muted-foreground">Send USDT TRC20 and submit proof for approval.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Amount (USDT, min $10)</Label>
                    <Input type="number" min="10" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="10.00" required className="h-10" />
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Payment Screenshot</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} required className="h-10" />
                  </div>
                  <Button type="submit" disabled={submittingDeposit} className="rounded-full px-6 h-10">
                    {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Withdraw Profits</CardTitle>
                <p className="text-sm text-muted-foreground">Available: <span className="text-emerald-600 font-semibold">${Number(profile.profits).toFixed(2)}</span></p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdraw} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">USDT TRC20 Wallet Address</Label>
                    <Input value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} placeholder="T..." required className="h-10" />
                  </div>
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
            {/* Deposits */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowDownToLine className="h-4 w-4 text-primary" /> Deposit History</CardTitle></CardHeader>
              <CardContent>
                {deposits.length === 0 ? <p className="text-sm text-muted-foreground py-4">No deposits yet.</p> : (
                  <div className="divide-y divide-border">
                    {deposits.map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-semibold text-sm">${Number(d.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={statusColor(d.status)} className="text-[10px]">{d.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Withdrawals */}
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
            {/* Profit Logs */}
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

          <TabsContent value="chat">
            <Card className="overflow-hidden">
              <div className="h-[500px]">
                <ChatPanel
                  channel="group"
                  title="Investors Community"
                  icon={<UsersIcon className="h-4 w-4 text-primary" />}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} className="h-16 w-16 object-cover" alt="avatar" />
                    ) : (
                      <User className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{profile.name || "No name set"}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Profile Picture</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="h-10" />
                </div>
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
