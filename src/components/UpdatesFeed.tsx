import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Megaphone, BookOpen } from "lucide-react";

const categoryIcon: Record<string, any> = {
  news: Newspaper,
  announcement: Megaphone,
  blog: BookOpen,
};

const categoryColor: Record<string, string> = {
  news: "bg-blue-500/10 text-blue-600",
  announcement: "bg-amber-500/10 text-amber-600",
  blog: "bg-emerald-500/10 text-emerald-600",
};

export default function UpdatesFeed() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("platform_updates")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setUpdates(data || []));
  }, []);

  if (updates.length === 0)
    return <p className="text-sm text-muted-foreground text-center py-6">No updates yet.</p>;

  return (
    <div className="space-y-3">
      {updates.map((u) => {
        const Icon = categoryIcon[u.category] || Megaphone;
        return (
          <Card key={u.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColor[u.category] || "bg-primary/10 text-primary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{u.title}</p>
                    <Badge variant="secondary" className="text-[10px] capitalize">{u.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{u.content}</p>
                  {u.image_url && <img src={u.image_url} alt="" className="mt-3 rounded-lg max-h-48 object-cover w-full" />}
                  {u.video_url && (
                    <video src={u.video_url} controls className="mt-3 rounded-lg max-h-48 w-full" />
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(u.created_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
