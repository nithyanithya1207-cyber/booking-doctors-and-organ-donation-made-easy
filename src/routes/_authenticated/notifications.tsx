import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | MediLink" },
      { name: "description", content: "Appointment confirmations and organ donation updates." },
      { property: "og:title", content: "Notifications | MediLink" },
      { property: "og:description", content: "Stay updated on bookings and donation activity." },
    ],
  }),
  component: NotificationsPage,
});

type Notif = { id: string; title: string; message: string; read: boolean; created_at: string };

function NotificationsPage() {
  const [rows, setRows] = useState<Notif[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Notif[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Appointment confirmations and donation updates.</p>
        </div>
        <Button variant="outline" onClick={markAll}>
          Mark all as read
        </Button>
      </div>

      <div className="grid gap-3">
        {rows.map((n) => (
          <Card key={n.id} className={n.read ? "opacity-70" : ""}>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Bell className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{n.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{n.message}</p>
              <p className="mt-1 text-xs">{new Date(n.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No notifications yet.</p>}
      </div>
    </div>
  );
}