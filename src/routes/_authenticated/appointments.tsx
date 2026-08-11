import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({
    meta: [
      { title: "My Appointments | MediLink" },
      { name: "description", content: "View, confirm or cancel your doctor appointments." },
      { property: "og:title", content: "My Appointments | MediLink" },
      { property: "og:description", content: "Track the status of your booked consultations." },
    ],
  }),
  component: AppointmentsPage,
});

type Appt = {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: string;
  doctors: { name: string; specialization: string; hospital: string; city: string } | null;
};

const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "default",
};

function AppointmentsPage() {
  const { isAdmin, isDoctor } = useAuth();
  const [rows, setRows] = useState<Appt[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctors(name, specialization, hospital, city)")
      .order("appointment_date", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Appt[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (a: Appt, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", a.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(
      a.patient_id,
      `Appointment ${status}`,
      `Your appointment with ${a.doctors?.name ?? "the doctor"} on ${a.appointment_date} is now ${status}.`,
    );
    toast.success(`Appointment ${status}`);
    void load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">
          {isAdmin || isDoctor ? "Manage appointment requests." : "Your booked consultations."}
        </p>
      </div>

      <div className="grid gap-4">
        {rows.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{a.doctors?.name ?? "Doctor"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {a.doctors?.specialization} · {a.doctors?.hospital}, {a.doctors?.city}
                </p>
              </div>
              <Badge variant={statusColor[a.status] ?? "secondary"}>{a.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                {a.appointment_date} at {a.appointment_time}
              </p>
              {a.reason && <p className="text-muted-foreground">Reason: {a.reason}</p>}
              <div className="flex flex-wrap gap-2">
                {(isAdmin || isDoctor) && a.status === "pending" && (
                  <Button size="sm" onClick={() => setStatus(a, "confirmed")}>
                    Confirm
                  </Button>
                )}
                {(isAdmin || isDoctor) && a.status === "confirmed" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(a, "completed")}>
                    Mark completed
                  </Button>
                )}
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <Button size="sm" variant="destructive" onClick={() => setStatus(a, "cancelled")}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">No appointments yet.</p>}
      </div>
    </div>
  );
}