import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ChatPanel from "./ChatPanel";
import { cn } from "@/lib/utils";

export default function SupportBubble() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const channel = `support_${user.id}`;

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
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-4 right-4 sm:right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105",
          open ? "bg-muted text-foreground" : "bg-primary text-primary-foreground shadow-primary/30"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
