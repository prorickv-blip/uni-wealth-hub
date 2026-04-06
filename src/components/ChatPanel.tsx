import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  channel: string;
  message: string;
  sender_name: string;
  sender_avatar: string | null;
  created_at: string;
}

interface ChatPanelProps {
  channel: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function ChatPanel({ channel, title, icon, className }: ChatPanelProps) {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name, avatar_url").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchMessages();

    const sub = supabase
      .channel(`chat-${channel}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `channel=eq.${channel}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setMessages((prev) => [...prev, payload.new as Message]);
        } else if (payload.eventType === "DELETE") {
          setMessages((prev) => prev.filter(m => m.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user, channel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("channel", channel)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages(data || []);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !user || !profile) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      channel,
      message: newMsg.trim(),
      sender_name: profile.name || user.email?.split("@")[0] || "User",
      sender_avatar: profile.avatar_url,
    });
    setNewMsg("");
    setSending(false);
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else setMessages(prev => prev.filter(m => m.id !== id));
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateSeparator = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const dateStr = new Date(m.created_at).toDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateStr) {
      last.msgs.push(m);
    } else {
      groupedMessages.push({ date: dateStr, msgs: [m] });
    }
  });

  return (
    <div className={cn("flex flex-col h-full bg-[hsl(var(--background))]", className)}>
      {/* Telegram-style header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/5">
        {icon}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{title}</h3>
          <p className="text-[10px] text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages area with wallpaper-like bg */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0 bg-muted/20">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
            </div>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex justify-center my-3">
              <span className="text-[10px] bg-muted/80 text-muted-foreground px-3 py-1 rounded-full font-medium">
                {formatDateSeparator(group.msgs[0].created_at)}
              </span>
            </div>
            {group.msgs.map((m) => {
              const isMe = m.user_id === user?.id;
              return (
                <div key={m.id} className={cn("flex gap-1.5 mb-1 group", isMe ? "justify-end" : "justify-start")}>
                  {/* Avatar for others */}
                  {!isMe && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-auto text-[10px] font-bold text-primary overflow-hidden">
                      {m.sender_avatar ? (
                        <img src={m.sender_avatar} className="h-7 w-7 rounded-full object-cover" alt="" />
                      ) : (
                        m.sender_name.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                  <div className={cn(
                    "relative max-w-[75%] px-3 py-1.5 text-sm shadow-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                      : "bg-card border border-border rounded-2xl rounded-bl-sm"
                  )}>
                    {!isMe && (
                      <p className={cn("text-[10px] font-semibold mb-0.5", isMe ? "text-primary-foreground/80" : "text-primary")}>
                        {m.sender_name}
                      </p>
                    )}
                    <p className="break-words leading-relaxed">{m.message}</p>
                    <div className={cn("flex items-center gap-1 justify-end mt-0.5", isMe ? "text-primary-foreground/50" : "text-muted-foreground")}>
                      <span className="text-[9px]">{formatTime(m.created_at)}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                    {/* Admin delete button */}
                    {isAdmin && (
                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                  {/* Avatar for me */}
                  {isMe && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-auto text-[10px] font-bold text-primary overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="h-7 w-7 rounded-full object-cover" alt="" />
                      ) : (
                        (profile?.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={sendMessage} className="p-2 border-t border-border flex gap-2 bg-background">
        <Input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Message..."
          className="h-10 rounded-full text-sm border-muted"
        />
        <Button type="submit" size="icon" disabled={sending || !newMsg.trim()} className="rounded-full h-10 w-10 flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
