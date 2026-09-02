import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Login | MediLink" },
      { name: "description", content: "Secure admin access to the MediLink management console." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Login | MediLink" },
      { property: "og:description", content: "Secure admin access to the MediLink management console." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      if (roles?.some((r) => r.role === "admin")) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    setLoading(false);
    if (!roles?.some((r) => r.role === "admin")) {
      toast.error("This account is not an admin.");
      await supabase.auth.signOut();
      return;
    }
    toast.success("Welcome, admin!");
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center gap-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-lg font-semibold">MediLink Admin</span>
          </div>
          <CardTitle className="mt-2">Admin Login</CardTitle>
          <CardDescription>Sign in with an administrator account to manage the portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={login} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="a-email">Email</Label>
              <Input id="a-email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-pass">Password</Label>
              <Input id="a-pass" name="password" type="password" required />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "Checking..." : "Login as Admin"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link to="/auth" className="text-primary underline">
              Go to user login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
