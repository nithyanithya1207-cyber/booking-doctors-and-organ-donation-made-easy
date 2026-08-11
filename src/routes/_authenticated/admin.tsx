import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console | MediLink" },
      { name: "description", content: "Manage doctors, patients, donors and appointments." },
      { property: "og:title", content: "Admin Console | MediLink" },
      { property: "og:description", content: "Administration for the healthcare management system." },
    ],
  }),
  component: AdminPage,
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

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [donors, setDonors] = useState<{ id: string; full_name: string; blood_group: string; city: string; organs: string[] }[]>([]);
  const [appts, setAppts] = useState<
    { id: string; appointment_date: string; appointment_time: string; status: string; doctors: { name: string } | null }[]
  >([]);

  const load = useCallback(async () => {
    const [d, dn, ap] = await Promise.all([
      supabase.from("doctors").select("*").order("name"),
      supabase.from("donors").select("id, full_name, blood_group, city, organs"),
      supabase.from("appointments").select("id, appointment_date, appointment_time, status, doctors(name)"),
    ]);
    setDoctors((d.data ?? []) as Doctor[]);
    setDonors((dn.data ?? []) as typeof donors);
    setAppts((ap.data ?? []) as unknown as typeof appts);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const { error } = await supabase.from("doctors").insert({
      name: String(f.get("name")),
      specialization: String(f.get("specialization")),
      hospital: String(f.get("hospital")),
      city: String(f.get("city")),
      fee: Number(f.get("fee")) || 0,
      available_days: String(f.get("available_days")),
      contact: String(f.get("contact")),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Doctor added");
    form.reset();
    void load();
  };

  const removeDoctor = async (id: string) => {
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Doctor removed");
    void load();
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!isAdmin)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admins only</CardTitle>
          <CardDescription>You need an admin account to open this console.</CardDescription>
        </CardHeader>
      </Card>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin console</h1>
        <p className="text-muted-foreground">Manage doctors, donors and appointments.</p>
      </div>

      <Tabs defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addDoctor} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" name="specialization" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input id="hospital" name="hospital" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-city">City</Label>
                  <Input id="a-city" name="city" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fee">Fee</Label>
                  <Input id="fee" name="fee" type="number" defaultValue={500} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="available_days">Available days</Label>
                  <Input id="available_days" name="available_days" defaultValue="Mon-Fri" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact">Contact</Label>
                  <Input id="contact" name="contact" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Add doctor</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.specialization}</TableCell>
                  <TableCell>{d.hospital}</TableCell>
                  <TableCell>{d.city}</TableCell>
                  <TableCell>₹{d.fee}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => removeDoctor(d.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="donors" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood group</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Organs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.full_name}</TableCell>
                  <TableCell>{d.blood_group}</TableCell>
                  <TableCell>{d.city}</TableCell>
                  <TableCell>{d.organs.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="appointments" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.doctors?.name ?? "—"}</TableCell>
                  <TableCell>{a.appointment_date}</TableCell>
                  <TableCell>{a.appointment_time}</TableCell>
                  <TableCell>{a.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}