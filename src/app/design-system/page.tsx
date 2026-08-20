import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Surface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Design system | Magna-Q",
  description: "Open Fashion-derived foundations and components for Magna-Q.",
};

const colors = [
  ["Primary", "#A8715A", "bg-brand-600"],
  ["Secondary", "#DD8560", "bg-accent"],
  ["Title", "#202224", "bg-ink"],
  ["Body", "#333333", "bg-body"],
  ["Label", "#555555", "bg-muted"],
  ["Placeholder", "#888888", "bg-placeholder"],
  ["Soft", "#F8F0E7", "bg-soft border border-line"],
  ["Field", "#F9F9F9", "bg-field border border-line"],
] as const;

export default function DesignSystemPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="eyebrow">Internal reference</p>
        <h1 className="mt-4 text-4xl font-normal tracking-[0.02em] sm:text-5xl">
          Magna-Q design system
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          A healthcare adaptation of the Open Fashion Figma system. Use this
          page to see the shared foundations and component variants before
          introducing a new pattern.
        </p>

        <Section title="Colour">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map(([name, value, className]) => (
              <div key={name}>
                <div className={`h-24 ${className}`} />
                <p className="mt-3 text-sm text-ink">{name}</p>
                <p className="mt-1 text-xs text-muted">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <Surface className="space-y-10 p-6 sm:p-8">
            <TypeRow
              label="Display"
              className="text-4xl leading-tight tracking-[0.02em]"
              text="A clear path to residency"
            />
            <TypeRow
              label="Title"
              className="text-lg uppercase leading-10 tracking-[4px]"
              text="Title uppercase"
            />
            <TypeRow
              label="Subtitle"
              className="text-base uppercase leading-6 tracking-[2px]"
              text="Subtitle uppercase"
            />
            <TypeRow
              label="Body large"
              className="text-base leading-6 text-muted"
              text="Readable guidance for every stage of your licensing and residency journey."
            />
            <TypeRow
              label="Body small"
              className="text-xs leading-[18px] text-muted"
              text="Supporting details, timestamps, and short educational disclaimers."
            />
          </Surface>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small primary</Button>
            <Button>Medium primary</Button>
            <Button size="lg" trailingIcon="→">
              Large primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Tags and fields">
          <div className="grid gap-8 lg:grid-cols-2">
            <Surface className="flex flex-wrap items-start gap-3 p-6">
              <Badge>#Step2CK</Badge>
              <Badge variant="outline" dismissIcon="×">
                Cardiology
              </Badge>
              <Badge variant="accent">In progress</Badge>
            </Surface>
            <Surface className="space-y-5 p-6">
              <Field
                id="sample-email"
                label="Email address"
                type="email"
                placeholder="doctor@example.com"
                hint="We use this only for your account."
              />
              <Field
                id="sample-error"
                label="Question count"
                type="number"
                defaultValue={0}
                error="Enter at least one question."
              />
            </Surface>
          </div>
        </Section>

        <Section title="Surfaces">
          <div className="grid gap-4 sm:grid-cols-3">
            <Surface className="p-6">
              <p className="eyebrow">Default</p>
              <p className="mt-3 text-muted">Primary grouped content.</p>
            </Surface>
            <Surface tone="soft" className="p-6">
              <p className="eyebrow">Warm soft</p>
              <p className="mt-3 text-body">Brand storytelling and callouts.</p>
            </Surface>
            <Surface tone="field" className="p-6">
              <p className="eyebrow">Field</p>
              <p className="mt-3 text-muted">Subtle secondary regions.</p>
            </Surface>
          </div>
        </Section>
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-line pt-8">
      <h2 className="text-xl uppercase tracking-[0.12em]">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function TypeRow({
  label,
  className,
  text,
}: {
  label: string;
  className: string;
  text: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
      <p className="text-xs uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className={className}>{text}</p>
    </div>
  );
}
