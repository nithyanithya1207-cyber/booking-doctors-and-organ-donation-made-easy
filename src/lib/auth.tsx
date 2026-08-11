import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "doctor" | "patient" | "donor";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  blood_group: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (u: User | null) => {
      if (!u) {
        if (!active) return;
        setProfile(null);
        setRoles([]);
        setLoading(false);
        return;
      }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.id),
      ]);
      if (!active) return;
      setProfile((p as Profile) ?? null);
      setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      void load(session?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      void load(data.session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = roles.includes("admin");
  const isDoctor = roles.includes("doctor");
  return { user, profile, roles, isAdmin, isDoctor, loading };
}

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const ORGANS = ["Kidney", "Liver", "Heart", "Lung", "Pancreas", "Cornea", "Bone Marrow", "Skin"];

// Simple compatibility map: donor blood group -> recipient groups it can donate to
const DONOR_TO_RECIPIENT: Record<string, string[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export function isBloodCompatible(donorGroup: string, recipientGroup: string) {
  return (DONOR_TO_RECIPIENT[donorGroup] ?? []).includes(recipientGroup);
}