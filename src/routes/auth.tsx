import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BLOOD_GROUPS } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | MediLink Healthcare Portal" },
      {
        name: "description",
        content:
          "Log in or register as a patient, doctor, donor or admin to book appointments and manage organ donation.",
      },
      { property: "og:title", content: "Sign in | MediLink Healthcare Portal" },
      { property: "og:description", content: "Access doctor booking and organ donation services." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const register = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: String(f.get("full_name")),
          phone: String(f.get("phone")),
          city: String(f.get("city")),
          blood_group: String(f.get("blood_group")),
          role: String(f.get("role")),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } else {
      toast.success("Check your email to confirm your account.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/40 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center gap-2 text-primary">
            <Database className="h-6 w-6" />
            <span className="text-lg font-semibold">MediLink</span>
          </div>
          <CardTitle className="mt-2">Doctor Booking &amp; Organ Donation</CardTitle>
          <CardDescription>Register or log in as Patient, Doctor, Donor or Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={login} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="l-email">Email</Label>
                  <Input id="l-email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="l-pass">Password</Label>
                  <Input id="l-pass" name="password" type="password" required />
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={register} className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="r-name">Full name</Label>
                    <Input id="r-name" name="full_name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-role">Register as</Label>
                    <select
                      id="r-role"
                      name="role"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      defaultValue="patient"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="donor">Donor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-phone">Phone</Label>
                    <Input id="r-phone" name="phone" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-city">City</Label>
                    <Input id="r-city" name="city" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-bg">Blood group</Label>
                    <select
                      id="r-bg"
                      name="blood_group"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      defaultValue="O+"
                    >
                      {BLOOD_GROUPS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-email">Email</Label>
                    <Input id="r-email" name="email" type="email" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-pass">Password</Label>
                  <Input id="r-pass" name="password" type="password" minLength={6} required />
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}