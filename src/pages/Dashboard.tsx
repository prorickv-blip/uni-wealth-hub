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
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Copy, LogOut, User, History, Share2, ShieldCheck } from "lucide-react";

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

    const { error } = await supabase.from("deposit_requests").insert({
      user_id: user!.id, amount: amt, screenshot_url: publicUrl, status: "pending",
    });
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

    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user!.id, amount: amt, wallet_address: walletAddr.trim(), status: "pending",
    });
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

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center bg-muted/30"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const statusColor = (s: string) => s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-sm">U</span>
            </div>
            <span className="font-display font-bold text-lg">UNI</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link to="/admin"><ShieldCheck className="h-4 w-4 mr-1" /> Admin</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8 space-y-6 sm:space-y-8 px-4 sm:px-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-sm border-border">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-2xl sm:text-3xl font-display font-bold truncate">${Number(profile.deposits).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Available Profits</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-primary truncate">${Number(profile.profits).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposit" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl h-auto p-1">
            <TabsTrigger value="deposit" className="text-xs sm:text-sm py-2"><ArrowDownToLine className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Deposit</span></TabsTrigger>
            <TabsTrigger value="withdraw" className="text-xs sm:text-sm py-2"><ArrowUpFromLine className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Withdraw</span></TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2"><History className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">History</span></TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2"><User className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Profile</span></TabsTrigger>
            <TabsTrigger value="referral" className="text-xs sm:text-sm py-2"><Share2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Invite</span></TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display">Make a Deposit</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Amount (USDT, min $10)</Label>
                    <Input type="number" min="10" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="10.00" required className="h-11" />
                  </div>
                  <div className="p-4 rounded-xl bg-muted border border-border space-y-2">
                    <p className="text-sm font-medium">Send USDT TRC20 to:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background p-2.5 rounded-lg flex-1 break-all border border-border">{WALLET_ADDRESS}</code>
                      <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { navigator.clipboard.writeText(WALLET_ADDRESS); toast.success("Copied!"); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Screenshot</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} required className="h-11" />
                  </div>
                  <Button type="submit" disabled={submittingDeposit} className="rounded-full px-6">
                    {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display">Withdraw Profits</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Available: <span className="text-primary font-semibold">${Number(profile.profits).toFixed(2)}</span></p>
                <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>USDT TRC20 Wallet Address</Label>
                    <Input value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} placeholder="T..." required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (min $15)</Label>
                    <Input type="number" min="15" step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="15.00" required className="h-11" />
                  </div>
                  <Button type="submit" disabled={submittingWithdraw} className="rounded-full px-6">
                    {submittingWithdraw ? "Submitting..." : "Submit Withdrawal"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display text-lg">Deposits</CardTitle></CardHeader>
              <CardContent>
                {deposits.length === 0 ? <p className="text-sm text-muted-foreground">No deposits yet.</p> : (
                  <div className="space-y-3">
                    {deposits.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 border border-border">
                        <div>
                          <p className="font-semibold">${Number(d.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={statusColor(d.status)}>{d.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display text-lg">Withdrawals</CardTitle></CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? <p className="text-sm text-muted-foreground">No withdrawals yet.</p> : (
                  <div className="space-y-3">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 border border-border">
                        <div>
                          <p className="font-semibold">${Number(w.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{w.wallet_address.slice(0, 10)}...</p>
                        </div>
                        <Badge variant={statusColor(w.status)}>{w.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display text-lg">Profit Logs</CardTitle></CardHeader>
              <CardContent>
                {profitLogs.length === 0 ? <p className="text-sm text-muted-foreground">No profit distributions yet.</p> : (
                  <div className="space-y-3">
                    {profitLogs.map((pl) => (
                      <div key={pl.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="font-semibold text-primary">+${Number(pl.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(pl.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display">Edit Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="h-11" />
                </div>
                <Button onClick={handleProfileUpdate} className="rounded-full px-6">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="font-display">Invite Friends</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Share your unique referral link:</p>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${window.location.origin}/signup?ref=${profile.referral_code}`} className="h-11" />
                  <Button variant="outline" onClick={copyReferral} className="rounded-lg"><Copy className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
