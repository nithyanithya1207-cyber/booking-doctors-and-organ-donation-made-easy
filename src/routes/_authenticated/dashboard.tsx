import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, HeartHandshake, Stethoscope, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | MediLink" },
      { name: "description", content: "Overview of your appointments, donor registry and notifications." },
      { property: "og:title", content: "Dashboard | MediLink" },
      { property: "og:description", content: "Your healthcare activity at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, roles } = useAuth();
  const [stats, setStats] = useState({ doctors: 0, appointments: 0, donors: 0, unread: 0 });

  useEffect(() => {
    const run = async () => {
      const [d, a, dn, n] = await Promise.all([
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("donors").select("id", { count: "exact", head: true }),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
      ]);
      setStats({
        doctors: d.count ?? 0,
        appointments: a.count ?? 0,
        donors: dn.count ?? 0,
        unread: n.count ?? 0,
      });
    };
    void run();
  }, []);

  const cards = [
    { label: "Doctors available", value: stats.doctors, icon: Stethoscope, to: "/doctors" as const },
    { label: "My appointments", value: stats.appointments, icon: CalendarDays, to: "/appointments" as const },
    { label: "Registered donors", value: stats.donors, icon: HeartHandshake, to: "/donate" as const },
    { label: "Unread notifications", value: stats.unread, icon: Bell, to: "/notifications" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || "there"}</h1>
        <p className="text-muted-foreground">
          Signed in as {roles.join(", ") || "patient"} · Blood group {profile?.blood_group ?? "—"} ·{" "}
          {profile?.city ?? "—"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>• User registration &amp; login (Patient / Doctor / Donor / Admin)</p>
          <p>• Doctor management &amp; search</p>
          <p>• Online appointment booking</p>
          <p>• Organ donor registration</p>
          <p>• Donor matching by blood group, organ &amp; city</p>
          <p>• Notifications for bookings and donations</p>
          <p>• Admin management console</p>
          <p>• Secure cloud database with access rules</p>
        </CardContent>
      </Card>
    </div>
  );
}