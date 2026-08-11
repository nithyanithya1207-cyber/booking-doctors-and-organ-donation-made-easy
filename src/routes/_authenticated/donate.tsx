import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BLOOD_GROUPS, ORGANS, useAuth } from "@/lib/auth";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/donate")({
  head: () => ({
    meta: [
      { title: "Organ Donor Registration | MediLink" },
      { name: "description", content: "Register as an organ donor and choose which organs you wish to donate." },
      { property: "og:title", content: "Organ Donor Registration | MediLink" },
      { property: "og:description", content: "Join the organ donor registry and help save lives." },
    ],
  }),
  component: DonatePage,
});

type Donor = {
  id: string;
  user_id: string;
  full_name: string;
  age: number | null;
  blood_group: string;
  organs: string[];
  city: string;
  phone: string | null;
  medical_notes: string | null;
  available: boolean;
};

function DonatePage() {
  const { user, profile } = useAuth();
  const [mine, setMine] = useState<Donor | null>(null);
  const [all, setAll] = useState<Donor[]>([]);
  const [organs, setOrgans] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: m }, { data: a }] = await Promise.all([
      supabase.from("donors").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("donors").select("*").order("created_at", { ascending: false }),
    ]);
    setMine((m as Donor) ?? null);
    setOrgans(((m as Donor) ?? null)?.organs ?? []);
    setAll((a ?? []) as Donor[]);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const payload = {
      user_id: user.id,
      full_name: String(f.get("full_name")),
      age: Number(f.get("age")) || null,
      blood_group: String(f.get("blood_group")),
      organs,
      city: String(f.get("city")),
      phone: String(f.get("phone")),
      medical_notes: String(f.get("medical_notes")),
      available: true,
    };
    const { error } = mine
      ? await supabase.from("donors").update(payload).eq("id", mine.id)
      : await supabase.from("donors").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(user.id, "Donor registration updated", `Thank you for offering: ${organs.join(", ") || "—"}.`);
    toast.success("Donor details saved");
    void load();
  };

  const toggleAvailable = async () => {
    if (!mine) return;
    const { error } = await supabase.from("donors").update({ available: !mine.available }).eq("id", mine.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organ donor registration</h1>
        <p className="text-muted-foreground">Register once, update anytime. Your details help hospitals find matches.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mine ? "Update your donor profile" : "Register as a donor"}</CardTitle>
          <CardDescription>Select the organs you are willing to donate.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" defaultValue={mine?.full_name ?? profile?.full_name ?? ""} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" defaultValue={mine?.age ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blood_group">Blood group</Label>
                <select
                  id="blood_group"
                  name="blood_group"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={mine?.blood_group ?? profile?.blood_group ?? "O+"}
                >
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={mine?.city ?? profile?.city ?? ""} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={mine?.phone ?? profile?.phone ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Organs for donation</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ORGANS.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={organs.includes(o)}
                      onCheckedChange={(c) =>
                        setOrgans((prev) => (c ? [...prev, o] : prev.filter((x) => x !== o)))
                      }
                    />
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="medical_notes">Medical notes</Label>
              <Textarea id="medical_notes" name="medical_notes" defaultValue={mine?.medical_notes ?? ""} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button>{mine ? "Update registration" : "Register as donor"}</Button>
              {mine && (
                <Button type="button" variant="outline" onClick={toggleAvailable}>
                  Mark as {mine.available ? "unavailable" : "available"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Donor registry ({all.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {all.map((d) => (
            <Card key={d.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{d.full_name}</CardTitle>
                <Badge variant={d.available ? "default" : "secondary"}>
                  {d.available ? "Available" : "Unavailable"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>Blood group: {d.blood_group}</p>
                <p>City: {d.city}</p>
                <p>Organs: {d.organs.join(", ") || "—"}</p>
              </CardContent>
            </Card>
          ))}
          {all.length === 0 && <p className="text-muted-foreground">No donors registered yet.</p>}
        </div>
      </div>
    </div>
  );
}