import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CalendarCheck, Database, HeartHandshake, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediLink | Doctor Booking & Organ Donation Made Easy" },
      {
        name: "description",
        content:
          "Book doctor appointments online and register as an organ donor. Smart donor matching by blood group, organ type and city.",
      },
      { property: "og:title", content: "MediLink | Doctor Booking & Organ Donation Made Easy" },
      {
        property: "og:description",
        content: "A single platform for doctor appointments, organ donor registration and donor matching.",
      },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Users, title: "Multi-role login", text: "Register as Patient, Doctor, Donor or Admin." },
  { icon: Stethoscope, title: "Doctor management", text: "Add, update and browse doctor profiles." },
  { icon: CalendarCheck, title: "Appointment booking", text: "Search doctors and book slots online." },
  { icon: HeartHandshake, title: "Donor registration", text: "Register and choose organs to donate." },
  { icon: HeartPulse, title: "Donor matching", text: "Match by blood group, organ type and location." },
  { icon: Bell, title: "Notifications", text: "Appointment and donation status updates." },
  { icon: ShieldCheck, title: "Secure database", text: "Records protected by strict access rules." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <Database className="h-5 w-5" /> MediLink
          </span>
          <Link to="/auth">
            <Button size="sm">Login / Register</Button>
          </Link>
        </div>
      </header>

      <section className="bg-accent/40">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Booking Doctors and Organ Donation, made easy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One centralized healthcare platform for appointment scheduling and a reliable organ donor registry.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth">
              <Button size="lg">Get started</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Become a donor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <f.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        MediLink · Final year project · Doctor booking &amp; organ donation management system
      </footer>
    </div>
  );
}
