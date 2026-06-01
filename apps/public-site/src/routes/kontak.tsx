import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { submitContact } from "@shared/pb";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak Pers — Korps Publik & Pers" },
      {
        name: "description",
        content: "Kontak resmi untuk awak media, permintaan wawancara, dan konfirmasi rilis.",
      },
    ],
  }),
  component: KontakPage,
});

function KontakPage() {
  const { t, lang } = useI18n();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim() ?? "";
    const org = formData.get("org")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    const message = formData.get("message")?.toString().trim() ?? "";

    if (!name || !org || !email || !message) {
      setError(lang === "id" ? "Semua field harus diisi." : "All fields are required.");
      setSubmitting(false);
      return;
    }

    try {
      await submitContact({ name, org, email, message });
      setSent(true);
      event.currentTarget.reset();
    } catch (submitError) {
      console.error(submitError);
      setError(
        lang === "id"
          ? "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi."
          : "Unable to send the message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <SectionHeader
        number="09"
        eyebrow={lang === "id" ? "KONTAK" : "CONTACT"}
        title={t("sec_contact")}
        lead={t("contact_lead")}
      />

      <section className="container-px mx-auto grid max-w-7xl gap-12 pb-24 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <InfoItem
            icon={<Mail className="h-5 w-5" />}
            label="Email"
            value="pers@korpspublik.mil.id"
          />
          <InfoItem
            icon={<Phone className="h-5 w-5" />}
            label={lang === "id" ? "Hotline Pers" : "Press Hotline"}
            value="+62 21 5000 1945"
          />
          <InfoItem
            icon={<MapPin className="h-5 w-5" />}
            label={lang === "id" ? "Alamat" : "Address"}
            value={lang === "id"
              ? "Markas Korps Publik & Pers — Jl. Merdeka No. 17, Jakarta"
              : "Korps Publik & Pers HQ — 17 Merdeka St., Jakarta"}
          />

          <div className="border border-border bg-secondary p-6">
            <div className="eyebrow text-accent-red">
              {lang === "id" ? "JAM OPERASIONAL" : "OPERATING HOURS"}
            </div>
            <div className="mt-3 space-y-1 font-mono text-sm">
              <div>Sen–Jum · 08:00–17:00 WIB</div>
              <div>{lang === "id" ? "Sab" : "Sat"} · 09:00–13:00 WIB</div>
              <div className="text-accent-red">
                {lang === "id" ? "Hotline Pers · 24/7" : "Press Hotline · 24/7"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-border bg-card p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form_name")} name="name" required />
            <Field label={t("form_org")} name="org" required />
          </div>
          <Field label={t("form_email")} name="email" type="email" required className="mt-4" />
          <div className="mt-4">
            <label className="eyebrow text-muted-foreground">{t("form_msg")}</label>
            <textarea
              name="message"
              required
              rows={6}
              className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent-red"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex items-center gap-2 bg-accent-red px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-4 w-4" />
            {submitting
              ? lang === "id"
                ? "Mengirim..."
                : "Sending..."
              : t("form_send")}
          </button>
          {sent && (
            <p className="mt-4 text-sm text-emerald-700">
              {lang === "id"
                ? "Permintaan terkirim. Tim Penerangan akan merespons dalam 1×24 jam."
                : "Request sent. The Public Affairs team will respond within 24 hours."}
            </p>
          )}
          {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
        </form>
      </section>
    </SiteLayout>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border pb-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-navy text-navy-foreground">
        {icon}
      </div>
      <div>
        <div className="eyebrow text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="eyebrow text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent-red"
      />
    </div>
  );
}
