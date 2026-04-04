import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, ArrowDownToLine, ArrowUpFromLine, Zap, LogOut, ArrowLeft, Trash2, Image, MessageSquare, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminSupportChats from "@/components/AdminSupportChats";
import ChatPanel from "@/components/ChatPanel";

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

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/dashboard");
  }, [user, loading, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin]);

  const fetchAll = async () => {
    const [{ data: u }, { data: d }, { data: w }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("deposit_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(u || []);
    setDeposits(d || []);
    setWithdrawals(w || []);
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
    const { error: e1 } = await supabase.from("withdrawal_requests").update({ status: "approved" }).eq("id", wd.id);
    if (e1) { toast.error(e1.message); return; }
    const { error: e2 } = await supabase.from("profiles").update({ profits: profile.profits - wd.amount }).eq("user_id", wd.user_id);
    if (e2) toast.error(e2.message);
    else { toast.success("Withdrawal approved"); fetchAll(); }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) toast.error(error.message);
    else { toast.success("User deleted"); fetchAll(); }
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
    const { error } = await supabase.from("profiles").update(update).eq("user_id", adjustUserId);
    if (error) toast.error(error.message);
    else { toast.success("User updated"); setAdjustUserId(""); setAdjustDeposits(""); setAdjustProfits(""); fetchAll(); }
  };

  const getUserEmail = (userId: string) => users.find(u => u.user_id === userId)?.email || userId.slice(0, 8);

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  // Stats
  const totalDeposits = users.reduce((s, u) => s + Number(u.deposits), 0);
  const totalProfits = users.reduce((s, u) => s + Number(u.profits), 0);
  const pendingDeposits = deposits.filter(d => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-lg sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <span className="font-display font-bold text-base">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8" onClick={signOut}><LogOut className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline text-xs">Sign Out</span></Button>
        </div>
      </header>

      <main className="container py-6 space-y-6 px-4 sm:px-6 max-w-6xl">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Users</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Deposits</span>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-display font-bold">${totalDeposits.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Profits</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-display font-bold text-emerald-600">${totalProfits.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Pending Actions</span>
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-display font-bold">{pendingDeposits + pendingWithdrawals}</p>
              <p className="text-[10px] text-muted-foreground">{pendingDeposits} deposits · {pendingWithdrawals} withdrawals</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribute */}
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
          <TabsList className="grid grid-cols-5 w-full h-auto p-1 bg-muted/50">
            <TabsTrigger value="users" className="text-xs py-2"><Users className="h-3.5 w-3.5 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="deposits" className="text-xs py-2"><ArrowDownToLine className="h-3.5 w-3.5 mr-1" /> Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-xs py-2"><ArrowUpFromLine className="h-3.5 w-3.5 mr-1" /> Withdrawals</TabsTrigger>
            <TabsTrigger value="support" className="text-xs py-2"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Support</TabsTrigger>
            <TabsTrigger value="group" className="text-xs py-2"><Users className="h-3.5 w-3.5 mr-1" /> Group</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3 mt-4">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-semibold text-sm truncate">{u.name || "No name"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex gap-4 text-xs mt-1">
                        <span>Deposits: <strong>${Number(u.deposits).toFixed(2)}</strong></span>
                        <span>Profits: <strong className="text-emerald-600">${Number(u.profits).toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setAdjustUserId(u.user_id); setAdjustDeposits(String(u.deposits)); setAdjustProfits(String(u.profits)); }}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle className="font-display text-base">Adjust {u.email}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Deposits</Label>
                              <Input type="number" step="0.01" value={adjustDeposits} onChange={(e) => setAdjustDeposits(e.target.value)} className="h-10" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Profits</Label>
                              <Input type="number" step="0.01" value={adjustProfits} onChange={(e) => setAdjustProfits(e.target.value)} className="h-10" />
                            </div>
                            <Button onClick={handleAdjust} className="rounded-full px-6 h-9 text-sm">Save</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" className="h-8" onClick={() => deleteUser(u.user_id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No users yet.</p>}
          </TabsContent>

          <TabsContent value="deposits" className="space-y-3 mt-4">
            {deposits.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs text-muted-foreground">{getUserEmail(d.user_id)}</p>
                      <p className="font-semibold">${Number(d.amount).toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                      {d.screenshot_url && (
                        <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Image className="h-3 w-3" /> View Screenshot
                        </a>
                      )}
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
                      {w.status === "pending" && (
                        <Button size="sm" className="h-8 text-xs" onClick={() => approveWithdrawal(w)}>Approve</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {withdrawals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No withdrawal requests.</p>}
          </TabsContent>

          <TabsContent value="support" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Support Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSupportChats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group" className="mt-4">
            <Card className="overflow-hidden">
              <div className="h-[500px]">
                <ChatPanel
                  channel="group"
                  title="Group Chat (Admin View)"
                  icon={<Users className="h-4 w-4 text-primary" />}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
