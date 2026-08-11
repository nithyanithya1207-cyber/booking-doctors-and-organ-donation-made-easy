import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BLOOD_GROUPS, ORGANS, isBloodCompatible, useAuth } from "@/lib/auth";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/_authenticated/matching")({
  head: () => ({
    meta: [
      { title: "Donor Matching | MediLink" },
      { name: "description", content: "Match organ requests with donors by blood group, organ type and location." },
      { property: "og:title", content: "Donor Matching | MediLink" },
      { property: "og:description", content: "Find compatible organ donors instantly." },
    ],
  }),
  component: MatchingPage,
});

type Donor = {
  id: string;
  user_id: string;
  full_name: string;
  blood_group: string;
  organs: string[];
  city: string;
  phone: string | null;
  available: boolean;
};

type Req = {
  id: string;
  patient_name: string;
  organ: string;
  blood_group: string;
  city: string;
  urgency: string;
  status: string;
};

function MatchingPage() {
  const { user, profile } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [selected, setSelected] = useState<Req | null>(null);

  const load = useCallback(async () => {
    const [{ data: d }, { data: r }] = await Promise.all([
      supabase.from("donors").select("*").eq("available", true),
      supabase.from("organ_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setDonors((d ?? []) as Donor[]);
    setReqs((r ?? []) as Req[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("organ_requests").insert({
      patient_id: user.id,
      patient_name: String(f.get("patient_name")),
      organ: String(f.get("organ")),
      blood_group: String(f.get("blood_group")),
      city: String(f.get("city")),
      urgency: String(f.get("urgency")),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await notify(user.id, "Organ request created", `We are searching for a ${String(f.get("organ"))} donor.`);
    toast.success("Request submitted");
    void load();
  };

  const matchesFor = (r: Req) =>
    donors
      .filter((d) => d.organs.includes(r.organ) && isBloodCompatible(d.blood_group, r.blood_group))
      .map((d) => ({ ...d, score: d.city.toLowerCase() === r.city.toLowerCase() ? 100 : 70 }))
      .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Donor matching</h1>
        <p className="text-muted-foreground">Matches use organ type, blood-group compatibility and location.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create an organ request</CardTitle>
          <CardDescription>Register a patient's organ requirement.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createRequest} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="patient_name">Patient name</Label>
              <Input id="patient_name" name="patient_name" defaultValue={profile?.full_name ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="organ">Organ needed</Label>
              <select id="organ" name="organ" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {ORGANS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bg">Blood group</Label>
              <select
                id="bg"
                name="blood_group"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue={profile?.blood_group ?? "O+"}
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
              <Input id="city" name="city" defaultValue={profile?.city ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="urgency">Urgency</Label>
              <select id="urgency" name="urgency" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Submit request</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {reqs.map((r) => {
          const matches = matchesFor(r);
          const open = selected?.id === r.id;
          return (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    {r.organ} needed for {r.patient_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {r.blood_group} · {r.city} · {r.status}
                  </p>
                </div>
                <Badge variant={r.urgency === "critical" ? "destructive" : "secondary"}>{r.urgency}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setSelected(open ? null : r)}>
                  {open ? "Hide matches" : `Find matching donors (${matches.length})`}
                </Button>
                {open && (
                  <div className="grid gap-2">
                    {matches.map((m) => (
                      <div key={m.id} className="rounded-md border p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{m.full_name}</span>
                          <Badge variant="secondary">{m.score}% match</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {m.blood_group} · {m.city} · {m.organs.join(", ")}
                          {m.phone ? ` · ${m.phone}` : ""}
                        </p>
                      </div>
                    ))}
                    {matches.length === 0 && (
                      <p className="text-sm text-muted-foreground">No compatible donors found yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {reqs.length === 0 && <p className="text-muted-foreground">No organ requests yet.</p>}
      </div>
    </div>
  );
}