import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, Zap, LogOut, ArrowLeft, Trash2, Image, MessageSquare, DollarSign, TrendingUp, Activity, ShieldAlert, Settings, Newspaper, Bell, Share2, Mail, Lock, Flag, AlertTriangle, Upload, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSupportChats from "@/components/AdminSupportChats";
import ChatPanel from "@/components/ChatPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Admin() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [distributing, setDistributing] = useState(false);
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustDeposits, setAdjustDeposits] = useState("");
  const [adjustProfits, setAdjustProfits] = useState("");

  // Security
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);

  // Platform settings
  const [platformName, setPlatformName] = useState("UNI");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [gradientColor, setGradientColor] = useState("#4338CA");
  const [walletAddress, setWalletAddress] = useState("TH7aGzdMyxViEjo7nk7aRdkr6U171r8m12");
  const [airtelMerchantId, setAirtelMerchantId] = useState("7055987");
  const [airtelDialCode, setAirtelDialCode] = useState("*185*9#");
  const [logoUrl, setLogoUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Updates
  const [updates, setUpdates] = useState<any[]>([]);
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateContent, setNewUpdateContent] = useState("");
  const [newUpdateCategory, setNewUpdateCategory] = useState("announcement");
  const [newUpdateImage, setNewUpdateImage] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTarget, setNotifTarget] = useState("all");
  const [notifTargetUserId, setNotifTargetUserId] = useState("");

  // Inquiries
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/dashboard");
  }, [user, loading, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin]);

  const fetchAll = async () => {
    const [{ data: u }, { data: d }, { data: w }, { data: la }, { data: up }, { data: notifs }, { data: inq }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("deposit_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("login_attempts").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("platform_updates").select("*").order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(u || []);
    setDeposits(d || []);
    setWithdrawals(w || []);
    setLoginAttempts(la || []);
    setUpdates(up || []);
    setNotifications(notifs || []);
    setInquiries(inq || []);

    const { data: settings } = await supabase.from("platform_settings").select("*");
    if (settings) {
      for (const s of settings) {
        if (s.key === "platform_name") setPlatformName(s.value);
        if (s.key === "primary_color") setPrimaryColor(s.value);
        if (s.key === "gradient_color") setGradientColor(s.value);
        if (s.key === "wallet_address") setWalletAddress(s.value);
        if (s.key === "airtel_merchant_id") setAirtelMerchantId(s.value);
        if (s.key === "airtel_dial_code") setAirtelDialCode(s.value);
        if (s.key === "logo_url") setLogoUrl(s.value);
        if (s.key === "icon_url") setIconUrl(s.value);
      }
    }
  };

  const approveDeposit = async (dep: any) => {
    const { error: e1 } = await supabase.from("deposit_requests").update({ status: "approved" }).eq("id", dep.id);
    if (e1) { toast.error(e1.message); return; }
    const { error: e2 } = await supabase.from("profiles").update({ deposits: (users.find(u => u.user_id === dep.user_id)?.deposits || 0) + dep.amount }).eq("user_id", dep.user_id);
    if (e2) toast.error(e2.message);
    else { toast.success("Deposit approved"); fetchAll(); }
  };

  const rejectDeposit = async (id: string) => {
    await supabase.from("deposit_requests").update({ status: "rejected" }).eq("id", id);
    toast.success("Deposit rejected"); fetchAll();
  };

  const approveWithdrawal = async (wd: any) => {
    const profile = users.find(u => u.user_id === wd.user_id);
    if (!profile || profile.profits < wd.amount) { toast.error("Insufficient profits"); return; }
    await supabase.from("withdrawal_requests").update({ status: "approved" }).eq("id", wd.id);
    await supabase.from("profiles").update({ profits: profile.profits - wd.amount }).eq("user_id", wd.user_id);
    toast.success("Withdrawal approved"); fetchAll();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    await supabase.from("profiles").delete().eq("user_id", userId);
    toast.success("User deleted"); fetchAll();
  };

  const toggleLock = async (userId: string, locked: boolean) => {
    await supabase.from("profiles").update({ is_locked: !locked }).eq("user_id", userId);
    toast.success(locked ? "Account unlocked" : "Account locked"); fetchAll();
  };

  const toggleFlag = async (userId: string, flagged: boolean) => {
    await supabase.from("profiles").update({ is_flagged: !flagged }).eq("user_id", userId);
    toast.success(flagged ? "Flag removed" : "Account flagged"); fetchAll();
  };

  const distributeProfits = async () => {
    setDistributing(true);
    const { error } = await supabase.rpc("distribute_daily_profits");
    setDistributing(false);
    if (error) toast.error(error.message);
    else { toast.success("Daily profits distributed!"); fetchAll(); }
  };

  const handleAdjust = async () => {
    if (!adjustUserId) return;
    const update: any = {};
    if (adjustDeposits !== "") update.deposits = parseFloat(adjustDeposits);
    if (adjustProfits !== "") update.profits = parseFloat(adjustProfits);
    if (Object.keys(update).length === 0) return;
    await supabase.from("profiles").update(update).eq("user_id", adjustUserId);
    toast.success("User updated"); setAdjustUserId(""); setAdjustDeposits(""); setAdjustProfits(""); fetchAll();
  };

  const upsertSetting = async (key: string, value: string) => {
    const { data } = await supabase.from("platform_settings").select("id").eq("key", key).maybeSingle();
    if (data) {
      await supabase.from("platform_settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("platform_settings").insert({ key, value });
    }
  };

  const savePlatformSettings = async () => {
    await Promise.all([
      upsertSetting("platform_name", platformName),
      upsertSetting("primary_color", primaryColor),
      upsertSetting("gradient_color", gradientColor),
      upsertSetting("wallet_address", walletAddress),
      upsertSetting("airtel_merchant_id", airtelMerchantId),
      upsertSetting("airtel_dial_code", airtelDialCode),
      upsertSetting("logo_url", logoUrl),
      upsertSetting("icon_url", iconUrl),
    ]);
    toast.success("All settings saved!");
  };

  const publishUpdate = async () => {
    if (!newUpdateTitle.trim() || !newUpdateContent.trim()) { toast.error("Title and content required"); return; }
    await supabase.from("platform_updates").insert({
      title: newUpdateTitle.trim(),
      content: newUpdateContent.trim(),
      category: newUpdateCategory,
      image_url: newUpdateImage.trim() || null,
    });
    toast.success("Update published!");
    setNewUpdateTitle(""); setNewUpdateContent(""); setNewUpdateImage("");
    fetchAll();
  };

  const deleteUpdate = async (id: string) => {
    await supabase.from("platform_updates").delete().eq("id", id);
    toast.success("Update deleted"); fetchAll();
  };

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) { toast.error("Title and message required"); return; }
    await supabase.from("notifications").insert({
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      target: notifTarget,
      target_user_id: notifTarget === "specific" ? notifTargetUserId : null,
    });
    toast.success("Notification sent!");
    setNotifTitle(""); setNotifMessage(""); setNotifTargetUserId("");
    fetchAll();
  };

  const getUserEmail = (userId: string) => users.find(u => u.user_id === userId)?.email || userId.slice(0, 8);

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const totalDeposits = users.reduce((s, u) => s + Number(u.deposits), 0);
  const totalProfits = users.reduce((s, u) => s + Number(u.profits), 0);
  const pendingDeposits = deposits.filter(d => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;
  const failedLogins = loginAttempts.filter(l => !l.success).length;
  const lockedUsers = users.filter(u => u.is_locked).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-lg sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <span className="font-display font-bold text-base">Admin Panel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="h-8" onClick={signOut}><LogOut className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline text-xs">Sign Out</span></Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6 px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Total Users</span><Users className="h-4 w-4 text-primary" /></div><p className="text-2xl font-display font-bold">{users.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Total Deposits</span><DollarSign className="h-4 w-4 text-primary" /></div><p className="text-2xl font-display font-bold">${totalDeposits.toFixed(2)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Total Profits</span><TrendingUp className="h-4 w-4 text-emerald-500" /></div><p className="text-2xl font-display font-bold text-emerald-600">${totalProfits.toFixed(2)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Security Alerts</span><ShieldAlert className="h-4 w-4 text-amber-500" /></div><p className="text-2xl font-display font-bold">{failedLogins}</p><p className="text-[10px] text-muted-foreground">{lockedUsers} locked accounts</p></CardContent></Card>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Daily Profit Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Adds 5% of each user's deposits to their profits</p>
            </div>
            <Button onClick={distributeProfits} disabled={distributing} className="rounded-full px-5 h-9 text-sm shadow-lg shadow-primary/20">
              {distributing ? "Distributing..." : "Distribute Daily Profit"}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="users">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-10 h-auto p-1 bg-muted/50">
              <TabsTrigger value="users" className="text-xs py-2 whitespace-nowrap"><Users className="h-3.5 w-3.5 mr-1" /> Users</TabsTrigger>
              <TabsTrigger value="deposits" className="text-xs py-2 whitespace-nowrap"><ArrowDownToLine className="h-3.5 w-3.5 mr-1" /> Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-xs py-2 whitespace-nowrap"><ArrowUpFromLine className="h-3.5 w-3.5 mr-1" /> Withdrawals</TabsTrigger>
              <TabsTrigger value="security" className="text-xs py-2 whitespace-nowrap"><ShieldAlert className="h-3.5 w-3.5 mr-1" /> Security</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs py-2 whitespace-nowrap"><Settings className="h-3.5 w-3.5 mr-1" /> Settings</TabsTrigger>
              <TabsTrigger value="updates" className="text-xs py-2 whitespace-nowrap"><Newspaper className="h-3.5 w-3.5 mr-1" /> Updates</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs py-2 whitespace-nowrap"><Bell className="h-3.5 w-3.5 mr-1" /> Notifs</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs py-2 whitespace-nowrap"><Share2 className="h-3.5 w-3.5 mr-1" /> Referrals</TabsTrigger>
              <TabsTrigger value="inquiries" className="text-xs py-2 whitespace-nowrap"><Mail className="h-3.5 w-3.5 mr-1" /> Inquiries</TabsTrigger>
              <TabsTrigger value="support" className="text-xs py-2 whitespace-nowrap"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Support</TabsTrigger>
            </TabsList>
          </div>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-3 mt-4">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{u.name || "No name"}</p>
                        {u.is_locked && <Badge variant="destructive" className="text-[10px]"><Lock className="h-3 w-3 mr-0.5" /> Locked</Badge>}
                        {u.is_flagged && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600"><Flag className="h-3 w-3 mr-0.5" /> Flagged</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex gap-4 text-xs mt-1">
                        <span>Deposits: <strong>${Number(u.deposits).toFixed(2)}</strong></span>
                        <span>Profits: <strong className="text-emerald-600">${Number(u.profits).toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2" onClick={() => toggleLock(u.user_id, u.is_locked)}>
                        <Lock className="h-3 w-3 mr-0.5" /> {u.is_locked ? "Unlock" : "Lock"}
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2" onClick={() => toggleFlag(u.user_id, u.is_flagged)}>
                        <Flag className="h-3 w-3 mr-0.5" /> {u.is_flagged ? "Unflag" : "Flag"}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2" onClick={() => { setAdjustUserId(u.user_id); setAdjustDeposits(String(u.deposits)); setAdjustProfits(String(u.profits)); }}>Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle className="font-display text-base">Adjust {u.email}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-1.5"><Label className="text-xs">Deposits</Label><Input type="number" step="0.01" value={adjustDeposits} onChange={(e) => setAdjustDeposits(e.target.value)} className="h-10" /></div>
                            <div className="space-y-1.5"><Label className="text-xs">Profits</Label><Input type="number" step="0.01" value={adjustProfits} onChange={(e) => setAdjustProfits(e.target.value)} className="h-10" /></div>
                            <Button onClick={handleAdjust} className="rounded-full px-6 h-9 text-sm">Save</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" className="h-7 px-2" onClick={() => deleteUser(u.user_id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No users yet.</p>}
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="space-y-3 mt-4">
            {deposits.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs text-muted-foreground">{getUserEmail(d.user_id)}</p>
                      <p className="font-semibold">{d.currency === "UGX" ? `UGX ${Number(d.amount).toLocaleString()}` : `$${Number(d.amount).toFixed(2)}`}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString()} • {d.payment_method === "airtel_money" ? "Airtel Money" : "USDT TRC20"}</p>
                      {d.screenshot_url && <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Image className="h-3 w-3" /> View Screenshot</a>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{d.status}</Badge>
                      {d.status === "pending" && (
                        <>
                          <Button size="sm" className="h-8 text-xs" onClick={() => approveDeposit(d)}>Approve</Button>
                          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => rejectDeposit(d.id)}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {deposits.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No deposit requests.</p>}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {withdrawals.map((w) => (
              <Card key={w.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs text-muted-foreground">{getUserEmail(w.user_id)}</p>
                      <p className="font-semibold">${Number(w.amount).toFixed(2)}</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">{w.wallet_address}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={w.status === "approved" ? "default" : "secondary"} className="text-[10px]">{w.status}</Badge>
                      {w.status === "pending" && <Button size="sm" className="h-8 text-xs" onClick={() => approveWithdrawal(w)}>Approve</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {withdrawals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No withdrawal requests.</p>}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-500" /> Anti-Cheat & Login Monitoring</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{loginAttempts.length}</p>
                    <p className="text-[10px] text-muted-foreground">Total Attempts</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-emerald-600">{loginAttempts.filter(l => l.success).length}</p>
                    <p className="text-[10px] text-muted-foreground">Successful</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-destructive">{failedLogins}</p>
                    <p className="text-[10px] text-muted-foreground">Failed</p>
                  </div>
                </div>
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {loginAttempts.slice(0, 50).map((la) => (
                    <div key={la.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-medium">{la.email}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(la.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={la.success ? "default" : "destructive"} className="text-[10px]">
                        {la.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                  {loginAttempts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No login attempts recorded yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Branding & Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Platform Name</Label>
                  <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Logo URL (full size logo)</Label>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">App Icon URL (small square icon)</Label>
                  <Input value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://..." className="h-10" />
                </div>
                {(iconUrl || logoUrl) && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                    {iconUrl && <img src={iconUrl} alt="Icon preview" className="h-10 w-10 rounded-lg object-cover border border-border" />}
                    {logoUrl && <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" />}
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Primary Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-12 rounded border border-border cursor-pointer" />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 flex-1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Gradient Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={gradientColor} onChange={(e) => setGradientColor(e.target.value)} className="h-10 w-12 rounded border border-border cursor-pointer" />
                    <Input value={gradientColor} onChange={(e) => setGradientColor(e.target.value)} className="h-10 flex-1" />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${gradientColor})` }}>
                  <p className="text-white font-semibold text-sm text-center">Color Preview</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Payment Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">USDT TRC20 Wallet Address</Label>
                  <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="h-10 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Airtel Money Merchant ID</Label>
                  <Input value={airtelMerchantId} onChange={(e) => setAirtelMerchantId(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Airtel Dial Code</Label>
                  <Input value={airtelDialCode} onChange={(e) => setAirtelDialCode(e.target.value)} className="h-10" />
                </div>
              </CardContent>
            </Card>

            <Button onClick={savePlatformSettings} className="rounded-full px-8 h-10 text-sm shadow-lg shadow-primary/20">
              Save All Settings
            </Button>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Create Update</CardTitle></CardHeader>
              <CardContent className="space-y-3 max-w-lg">
                <Input placeholder="Title" value={newUpdateTitle} onChange={(e) => setNewUpdateTitle(e.target.value)} className="h-10" />
                <Textarea placeholder="Content..." value={newUpdateContent} onChange={(e) => setNewUpdateContent(e.target.value)} rows={3} />
                <Select value={newUpdateCategory} onValueChange={setNewUpdateCategory}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Image URL (optional)" value={newUpdateImage} onChange={(e) => setNewUpdateImage(e.target.value)} className="h-10" />
                <Button onClick={publishUpdate} className="rounded-full px-6 h-9 text-sm">Publish Update</Button>
              </CardContent>
            </Card>
            {updates.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{u.title}</p>
                      <Badge variant="secondary" className="text-[10px] capitalize">{u.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{u.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(u.created_at).toLocaleString()}</p>
                  </div>
                  <Button variant="destructive" size="sm" className="h-7 px-2 flex-shrink-0" onClick={() => deleteUpdate(u.id)}><Trash2 className="h-3 w-3" /></Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Send Notification</CardTitle></CardHeader>
              <CardContent className="space-y-3 max-w-lg">
                <Input placeholder="Title" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="h-10" />
                <Textarea placeholder="Message..." value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} rows={3} />
                <Select value={notifTarget} onValueChange={setNotifTarget}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                  </SelectContent>
                </Select>
                {notifTarget === "specific" && (
                  <Select value={notifTargetUserId} onValueChange={setNotifTargetUserId}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select user..." /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => <SelectItem key={u.user_id} value={u.user_id}>{u.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={sendNotification} className="rounded-full px-6 h-9 text-sm"><Bell className="h-3.5 w-3.5 mr-1.5" /> Send Notification</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Notification History</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{n.title}</p>
                        <Badge variant="secondary" className="text-[10px]">{n.target === "all" ? "All" : getUserEmail(n.target_user_id || "")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No notifications sent.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-3 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Share2 className="h-4 w-4 text-primary" /> Referral Links</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name || u.email}</p>
                        <p className="text-xs text-muted-foreground font-mono">{u.referral_code}</p>
                      </div>
                      <code className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded truncate max-w-[200px] hidden sm:block">
                        /signup?ref={u.referral_code}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-3 mt-4">
            {inquiries.map((inq) => (
              <Card key={inq.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{inq.name}</p>
                        <Badge variant={inq.status === "new" ? "default" : "secondary"} className="text-[10px]">{inq.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{inq.email}</p>
                      {inq.subject && <p className="text-xs font-medium mt-1">{inq.subject}</p>}
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{inq.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(inq.created_at).toLocaleString()}</p>
                    </div>
                    {inq.status === "new" && (
                      <Button variant="outline" size="sm" className="h-7 text-[11px] flex-shrink-0" onClick={async () => {
                        await supabase.from("inquiries").update({ status: "reviewed" }).eq("id", inq.id);
                        toast.success("Marked as reviewed"); fetchAll();
                      }}>Mark Reviewed</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {inquiries.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No inquiries yet.</p>}
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Support Conversations</CardTitle></CardHeader>
              <CardContent><AdminSupportChats /></CardContent>
            </Card>
            <Card className="overflow-hidden">
              <div className="h-[500px]">
                <ChatPanel channel="group" title="Group Chat (Admin View)" icon={<Users className="h-4 w-4 text-primary" />} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
