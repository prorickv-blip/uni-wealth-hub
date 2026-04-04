import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { user } = useAuth();
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
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel=eq.${channel}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
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

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{messages.length} messages</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map((m) => {
          const isMe = m.user_id === user?.id;
          return (
            <div key={m.id} className={cn("flex gap-2 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                {m.sender_avatar ? (
                  <img src={m.sender_avatar} className="h-8 w-8 rounded-full object-cover" alt="" />
                ) : (
                  m.sender_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className={cn(
                "rounded-2xl px-3 py-2 text-sm",
                isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted border border-border rounded-tl-sm"
              )}>
                {!isMe && <p className="text-xs font-semibold mb-0.5 opacity-70">{m.sender_name}</p>}
                <p className="break-words">{m.message}</p>
                <p className={cn("text-[10px] mt-1", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>{formatTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2 bg-background">
        <Input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="h-10 rounded-full text-sm"
        />
        <Button type="submit" size="icon" disabled={sending || !newMsg.trim()} className="rounded-full h-10 w-10 flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
