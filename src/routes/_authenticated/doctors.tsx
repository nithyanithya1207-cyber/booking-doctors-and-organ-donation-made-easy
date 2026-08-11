import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/doctors")({
  head: () => ({
    meta: [
      { title: "Find Doctors | MediLink" },
      { name: "description", content: "Search doctors by name, specialization or city and book an appointment." },
      { property: "og:title", content: "Find Doctors | MediLink" },
      { property: "og:description", content: "Search and book doctor appointments online." },
    ],
  }),
  component: DoctorsPage,
});

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  fee: number;
  available_days: string;
  contact: string | null;
};

function DoctorsPage() {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");
  const [booking, setBooking] = useState<Doctor | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("doctors").select("*").order("name");
    if (error) toast.error(error.message);
    setDoctors((data ?? []) as Doctor[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return doctors;
    return doctors.filter((d) =>
      [d.name, d.specialization, d.hospital, d.city].join(" ").toLowerCase().includes(t),
    );
  }, [doctors, q]);

  const book = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!booking || !user) return;
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_id: booking.id,
      appointment_date: String(f.get("date")),
      appointment_time: String(f.get("time")),
      reason: String(f.get("reason")),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(
      user.id,
      "Appointment requested",
      `Your appointment with ${booking.name} on ${String(f.get("date"))} at ${String(f.get("time"))} is pending confirmation.`,
    );
    toast.success("Appointment booked. Check notifications for confirmation.");
    setBooking(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find a doctor</h1>
        <p className="text-muted-foreground">Search by name, specialization, hospital or city.</p>
      </div>

      <Input placeholder="e.g. Cardiologist, Chennai, Apollo" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle className="text-lg">{d.name}</CardTitle>
              <Badge variant="secondary" className="w-fit">
                {d.specialization}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {d.hospital}, {d.city}
              </p>
              <p>Available: {d.available_days}</p>
              <p>Consultation fee: ₹{d.fee}</p>
              {d.contact && <p>Contact: {d.contact}</p>}
              <Dialog
                open={booking?.id === d.id}
                onOpenChange={(o) => setBooking(o ? d : null)}
              >
                <DialogTrigger asChild>
                  <Button className="mt-2 w-full">Book appointment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book with {d.name}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={book} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" name="time" type="time" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reason">Reason for visit</Label>
                      <Input id="reason" name="reason" placeholder="Fever, follow-up..." />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Booking as {profile?.full_name || "patient"}
                    </p>
                    <Button className="w-full">Confirm booking</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">No doctors match your search.</p>}
      </div>
    </div>
  );
}