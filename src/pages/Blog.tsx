import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Calendar } from "lucide-react";
import Footer from "@/components/Footer";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("platform_updates")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-sm">U</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">UNI</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/blog" className="text-foreground font-medium">Blog</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Log In</Link></Button>
            <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/25" asChild><Link to="/signup">Get Started</Link></Button>
          </div>
          <button className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-2 animate-fade-in">
            <Link to="/" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}><Link to="/login">Log In</Link></Button>
            <Button className="w-full rounded-full" asChild onClick={() => setMobileMenuOpen(false)}><Link to="/signup">Get Started</Link></Button>
          </div>
        )}
      </header>

      <section className="pt-28 sm:pt-36 pb-10 sm:pb-14 gradient-hero">
        <div className="container px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            News & <span className="text-gradient">Updates</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Stay informed with the latest from UNI Investment Platform.</p>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="container px-4 sm:px-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No posts yet. Check back soon!</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post.id} className="p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="w-full h-48 sm:h-64 object-cover rounded-xl mb-5" />
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="text-xs capitalize">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">{post.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{post.content}</p>
                  {post.video_url && (
                    <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-muted">
                      <iframe src={post.video_url.replace("youtu.be/", "youtube.com/embed/").replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen title={post.title} />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
