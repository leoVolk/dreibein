import type { ChangelogVersionProps, BadgeProps } from "@nuxt/ui";

type ChangeType = "feat" | "fix" | "security";

export type ChangelogEntry = ChangelogVersionProps & {
  changes: { type: ChangeType; label: string }[];
};

export const CHANGE_META: Record<ChangeType, { color: BadgeProps["color"]; label: string }> = {
  feat: { color: "primary", label: "Neu" },
  fix: { color: "error", label: "Fix" },
  security: { color: "warning", label: "Sicherheit" },
};

export const changelog: ChangelogEntry[] = [
  {
    title: "NaMi Integration & Teilnehmerverwaltung",
    date: "2026-06-04",
    badge: "0.5.0",
    changes: [
      { type: "feat", label: "Live NaMi Mitgliederliste über die NaMi API" },
      { type: "feat", label: "Mitglieder-Detailansicht als Drawer" },
      { type: "feat", label: "Suche und Zeilenauswahl in der Mitgliedertabelle" },
      { type: "feat", label: "Teilnehmerverwaltung: Hinzufügen, Anzeigen und Entfernen" },
      { type: "feat", label: "Eigenständige Teilnehmerseite pro Veranstaltung" },
      { type: "feat", label: "Zahlungsstatus-Toggle für Teilnehmer" },
      { type: "security", label: "Einladungen verwenden jetzt einen sicheren Token statt der Datensatz-ID" },
      { type: "security", label: "Einladungen laufen nach 1 Stunde ab" },
      { type: "security", label: "Server-seitiger Hook verhindert Registrierung ohne gültige Einladung" },
      { type: "fix", label: "Mitgliedsdaten wurden beim ersten Öffnen des Modals nicht geladen" },
    ],
  },
  {
    title: "Rechnungen & PDF-Export",
    date: "2026-06-01",
    badge: "0.4.0",
    changes: [
      { type: "feat", label: "Rechnungsverwaltung pro Veranstaltung" },
      { type: "feat", label: "PDF-Export für Rechnungen" },
      { type: "feat", label: "Währungsrechner für Rechnungsbeträge" },
      { type: "fix", label: "Fehler beim Währungsrechner behoben" },
      { type: "fix", label: "Typfehler in der Rechnungsansicht behoben" },
    ],
  },
  {
    title: "Einladungssystem",
    date: "2026-05-28",
    badge: "0.3.0",
    changes: [
      { type: "feat", label: "E-Mail-Einladungssystem mit angepasster E-Mail-Vorlage" },
      { type: "feat", label: "Einladungsbasierte Registrierungsseite" },
      { type: "fix", label: "Fehler beim Versenden von Einladungen behoben" },
    ],
  },
  {
    title: "Dashboard & Statistiken",
    date: "2026-05-23",
    badge: "0.2.0",
    changes: [
      { type: "feat", label: "Mitglieder-nach-Stufe Diagramm auf dem Dashboard" },
      { type: "feat", label: "NaMi-Statistiken auf der Startseite" },
      { type: "feat", label: "Sortierbare Stufen" },
      { type: "feat", label: "Migration auf UTable mit verbesserter Darstellung" },
      { type: "feat", label: "Caching für Dashboard-Daten" },
      { type: "feat", label: "Ladeanimationen für Statistik-Kacheln" },
    ],
  },
  {
    title: "Erstes Release",
    date: "2026-05-21",
    badge: "0.1.0",
    changes: [
      { type: "feat", label: "Veranstaltungsverwaltung mit Übersichtsseite" },
      { type: "feat", label: "Materiallisten pro Veranstaltung" },
      { type: "feat", label: "Einkaufslisten pro Veranstaltung" },
      { type: "feat", label: "Notizen pro Veranstaltung" },
      { type: "feat", label: "Echtzeit-Updates über PocketBase Subscriptions" },
      { type: "feat", label: "Benutzereinstellungen & Admin-Panel" },
    ],
  },
];
