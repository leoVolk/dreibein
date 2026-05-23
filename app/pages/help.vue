<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Hilfe & Info', to: '/help' },
      ]"
    />
    <UPageHeader title="Hilfe & Infos" />

    <p class="text-muted my-4">
      Willkommen bei 3Bein – der Verwaltungs-App für euren Pfadfinderstamm. Hier
      könnt ihr Materialien erfassen und ihren Zustand im Blick behalten, Läger
      und Aktionen planen, Materiallisten für Veranstaltungen zusammenstellen
      und Mitglieder verwalten. Alle Änderungen werden in Echtzeit
      synchronisiert, sodass alle Beteiligten immer auf dem aktuellen Stand
      sind. Falls ihr eine Frage habt, die hier nicht beantwortet wird, meldet
      euch gerne über den Feedback-Bereich.
    </p>

    <UAccordion
      :items="items"
      :ui="{
        trigger: 'text-base text-lg font-medium ',
        body: 'text-base text-muted',
      }"
    >
    </UAccordion>
  </div>
</template>

<script lang="ts" setup>
import type { AccordionItem } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const items = ref<AccordionItem[]>([
  {
    label: "Was ist Dreibein (3Bein)?",
    content:
      "Dreibein (3Bein) ist eine Webapp zur Materialverwaltung für Pfadfinderstämme. Sie hilft dabei, Materialien zu organisieren, Lager und Aktionen zu planen, Einkaufslisten zu erstellen und Mitglieder zu verwalten. Ziel ist es, die Planung und Organisation von Veranstaltungen deutlich einfacher zu machen.",
  },
  {
    label: "Wie erstelle ich eine neue Materialliste?",
    content:
      "Unter dem Menüpunkt „Material Listen“ kannst du eine neue Liste erstellen. Klicke dazu auf „Neue Liste anlegen“, gib der Liste einen Namen und speichere sie. Anschließend kannst du Materialien zu dieser Liste hinzufügen.",
  },
  {
    label: "Wie füge ich Materialien zu einer Materialliste hinzu?",
    content:
      "Öffne unter „Material Listen“ die gewünschte Liste. Dort kannst du neue Materialien hinzufügen. Die Materialien erscheinen anschließend in der Liste und können später auch bei Events verwendet werden.",
  },
  {
    label: "Kann ich Materialien bearbeiten oder löschen?",
    content:
      "Ja. Wenn du eine Materialliste öffnest, werden dir alle enthaltenen Materialien angezeigt. Dort kannst du Materialien bearbeiten oder löschen.",
  },
  {
    label: "Wo sehe ich alle angelegten Materialien?",
    content:
      "Unter dem Menüpunkt „Alle Materialien“ findest du eine Übersicht über sämtliche Materialien, die in deinen Materiallisten angelegt wurden.",
  },
  {
    label: "Wie erstelle ich ein Lager oder eine Aktion?",
    content:
      "Unter „Läger und Aktionen“ kannst du ein neues Event erstellen. Gib dem Event einen Namen und füge anschließend Materiallisten, Notizen, Teilnehmer und Einkaufslisten hinzu.",
  },
  {
    label: "Wie füge ich Materialien zu einem Event hinzu?",
    content:
      "Bei einem Event kannst du Materiallisten hinzufügen. Zu diesen Listen kannst du nur Materialien hinzufügen, die bereits zuvor unter „Material Listen“ angelegt wurden. Dadurch bleibt die Materialverwaltung übersichtlich und konsistent.",
  },
  {
    label: "Kann ein Event mehrere Materiallisten haben?",
    content:
      "Ja. Ein Event kann mehrere Materiallisten enthalten. Dadurch kannst du Materialien beispielsweise nach Bereichen oder Aktivitäten innerhalb eines Lagers strukturieren.",
  },
  {
    label: "Was kann ich alles zu einem Event hinzufügen?",
    content:
      "Zu jedem Event kannst du Materiallisten, Notizen, eine Teilnehmerliste sowie mehrere Einkaufslisten hinzufügen. Dadurch kannst du alle wichtigen Informationen und Planungen zentral an einem Ort verwalten.",
  },
  {
    label: "Wo sehe ich eine Übersicht aller Events?",
    content:
      "Im Menüpunkt „Kalender“ findest du alle angelegten Events übersichtlich in einer Kalenderansicht. So kannst du schnell sehen, wann welche Lager oder Aktionen stattfinden.",
  },
  {
    label: "Was ist der NaMi Mitgliederbereich?",
    content:
      "Im Bereich „NaMi Mitglieder“ werden alle Mitglieder angezeigt, die aus der NaMi importiert wurden. Diese Mitglieder können beispielsweise für Teilnehmerlisten bei Events genutzt werden.",
  },
  {
    label: "Wie importiere ich Mitglieder aus NaMi?",
    content:
      "Admins können unter „Einstellungen“ eine Mitgliederliste aus NaMi importieren. Nach dem Import erscheinen die Mitglieder automatisch im Bereich „NaMi Mitglieder“.",
  },
  {
    label: "Welche Einstellungen kann ich ändern?",
    content:
      "Unter „Einstellungen“ kannst du persönliche Einstellungen wie deinen Benutzernamen ändern.",
  },
  {
    label: "Was können Admins zusätzlich einstellen?",
    content:
      "Admins haben in den Einstellungen zusätzliche Funktionen. Sie können neue Admins hinzufügen und Mitgliederlisten aus NaMi importieren.",
  },
]);
</script>

<style></style>
