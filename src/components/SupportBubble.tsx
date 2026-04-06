import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ChatPanel from "./ChatPanel";
import { cn } from "@/lib/utils";

export default function SupportBubble() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const channel = user ? `support_${user.id}` : "";

  useEffect(() => {
    if (!user) return;
    // Listen for new support messages from admin
    const sub = supabase
      .channel(`support-notif-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel=eq.${channel}`,
      }, (payload) => {
        const msg = payload.new as any;
        if (msg.user_id !== user.id && !open) {
          setUnread(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user, open, channel]);

  if (!user) return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] h-[480px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <ChatPanel
            channel={channel}
            title="Support Chat"
            icon={<MessageCircle className="h-4 w-4 text-primary" />}
          />
        </div>
      )}
      <button
        onClick={() => { setOpen(!open); if (!open) setUnread(0); }}
        className={cn(
          "fixed bottom-4 right-4 sm:right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105",
          open ? "bg-muted text-foreground" : "bg-primary text-primary-foreground shadow-primary/30"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
