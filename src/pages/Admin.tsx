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
import { Users, ArrowDownToLine, ArrowUpFromLine, Zap, LogOut, ArrowLeft, Trash2, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
    toast.success("Deposit rejected");
    fetchAll();
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

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-muted/30"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="rounded-lg" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <span className="font-display font-bold text-lg">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sign Out</span></Button>
        </div>
      </header>

      <main className="container py-6 sm:py-8 space-y-6 px-4 sm:px-6">
        {/* Distribute profits */}
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Daily Profit Distribution</h3>
              <p className="text-sm text-muted-foreground">Adds 5% of each user's deposits to their profits</p>
            </div>
            <Button onClick={distributeProfits} disabled={distributing} className="rounded-full px-6 shadow-lg shadow-primary/25">
              {distributing ? "Distributing..." : "Distribute Daily Profit"}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-3 w-full max-w-md h-auto p-1">
            <TabsTrigger value="users" className="py-2"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="deposits" className="py-2"><ArrowDownToLine className="h-4 w-4 mr-1" /> Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals" className="py-2"><ArrowUpFromLine className="h-4 w-4 mr-1" /> Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-6">
            {users.map((u) => (
              <Card key={u.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold truncate">{u.name || "No name"}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span>Deposits: <strong>${Number(u.deposits).toFixed(2)}</strong></span>
                        <span>Profits: <strong className="text-primary">${Number(u.profits).toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { setAdjustUserId(u.user_id); setAdjustDeposits(String(u.deposits)); setAdjustProfits(String(u.profits)); }}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle className="font-display">Adjust {u.email}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Deposits</Label>
                              <Input type="number" step="0.01" value={adjustDeposits} onChange={(e) => setAdjustDeposits(e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                              <Label>Profits</Label>
                              <Input type="number" step="0.01" value={adjustProfits} onChange={(e) => setAdjustProfits(e.target.value)} className="h-11" />
                            </div>
                            <Button onClick={handleAdjust} className="rounded-full px-6">Save</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => deleteUser(u.user_id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="deposits" className="space-y-4 mt-6">
            {deposits.map((d) => (
              <Card key={d.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{getUserEmail(d.user_id)}</p>
                      <p className="font-semibold text-lg">${Number(d.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                      {d.screenshot_url && (
                        <a href={d.screenshot_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Image className="h-3 w-3" /> View Screenshot
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "secondary"}>{d.status}</Badge>
                      {d.status === "pending" && (
                        <>
                          <Button size="sm" className="rounded-lg" onClick={() => approveDeposit(d)}>Approve</Button>
                          <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => rejectDeposit(d.id)}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {deposits.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No deposit requests.</p>}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-4 mt-6">
            {withdrawals.map((w) => (
              <Card key={w.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{getUserEmail(w.user_id)}</p>
                      <p className="font-semibold text-lg">${Number(w.amount).toFixed(2)}</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">{w.wallet_address}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={w.status === "approved" ? "default" : "secondary"}>{w.status}</Badge>
                      {w.status === "pending" && (
                        <Button size="sm" className="rounded-lg" onClick={() => approveWithdrawal(w)}>Approve</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {withdrawals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No withdrawal requests.</p>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
