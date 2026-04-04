import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatPanel from "./ChatPanel";
import { MessageCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SupportThread {
  userId: string;
  email: string;
  name: string;
  lastMessage: string;
  lastAt: string;
}

export default function AdminSupportChats() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selected, setSelected] = useState<SupportThread | null>(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    // Get distinct support channels
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .like("channel", "support_%")
      .order("created_at", { ascending: false });

    if (!msgs) return;

    const channelMap = new Map<string, { userId: string; lastMessage: string; lastAt: string }>();
    for (const m of msgs) {
      const userId = m.channel.replace("support_", "");
      if (!channelMap.has(userId)) {
        channelMap.set(userId, { userId, lastMessage: m.message, lastAt: m.created_at });
      }
    }

    // Get user profiles
    const userIds = Array.from(channelMap.keys());
    if (userIds.length === 0) { setThreads([]); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, name")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const result: SupportThread[] = userIds.map(uid => {
      const ch = channelMap.get(uid)!;
      const prof = profileMap.get(uid);
      return {
        userId: uid,
        email: prof?.email || uid.slice(0, 8),
        name: prof?.name || "Unknown",
        lastMessage: ch.lastMessage,
        lastAt: ch.lastAt,
      };
    });

    setThreads(result);
  };

  if (selected) {
    return (
      <div className="h-[500px] flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-semibold text-sm">{selected.name}</span>
          <span className="text-xs text-muted-foreground">{selected.email}</span>
        </div>
        <Card className="flex-1 overflow-hidden">
          <ChatPanel
            channel={`support_${selected.userId}`}
            title={`Chat with ${selected.name}`}
            icon={<MessageCircle className="h-4 w-4 text-primary" />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No support conversations yet.</p>
      )}
      {threads.map((t) => (
        <Card
          key={t.userId}
          className="p-4 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setSelected(t)}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground truncate">{t.email}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{t.lastMessage}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {new Date(t.lastAt).toLocaleDateString()}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
