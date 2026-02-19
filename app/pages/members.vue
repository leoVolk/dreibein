<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'NaMi Mitglieder', to: '/members' },
        ]"
      />
    </div>

    <UCard variant="subtle" v-if="members.length">
      <template #header>
        <h2 class="text-2xl">Alle NaMi Mitglieder</h2>
        <p class="mt-4">
          Hier findest du alle NaMi Mitglieder die importiert wurden. <br />
          Sollte die Liste leer sein, importiere eine NaMi Excel Datei in den
          <ULink inactive-class="text-primary font-semibold" to="/settings">
            Einstellungen
          </ULink>

          (nur für Admins verfügbar)
        </p></template
      >
      <template #default>
        <div class="flex flex-col flex-1 w-full">
          <div class="flex pb-4 border-b border-accented">
            <UInput
              size="xl"
              v-model="globalFilter"
              class="w-full"
              placeholder="Suche..."
            />
          </div>

          <UTable
            ref="table"
            v-model:global-filter="globalFilter"
            sticky
            class="max-h-256"
            :data="members"
            :columns="columns"
          />
        </div>
      </template>
    </UCard>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const { pb } = usePocketbase();

const members = ref();
const globalFilter = ref("");

const getNamiMembers = async () => {
  members.value = await pb.collection("members").getFullList();
};

const columns: TableColumn<any>[] = [
  { header: "Mitgliedsnummer", accessorKey: "memberNumber" },
  { header: "Vorname", accessorKey: "firstName" },
  { header: "Nachname", accessorKey: "lastName" },
  { header: "Geschlecht", accessorKey: "gender" },
  { header: "Staatsangehoerigkeit", accessorKey: "nationality" },
  { header: "Strasse", accessorKey: "street" },
  { header: "PLZ", accessorKey: "postalCode" },
  { header: "Ort", accessorKey: "city" },
  { header: "EMail", accessorKey: "email" },
  {
    header: "EMailErziehungsberechtigter",
    accessorKey: "guardianEmail",
  },
  { header: "Telefon1", accessorKey: "phone1" },
  { header: "Telefon2", accessorKey: "phone2" },
  { header: "Telefon3", accessorKey: "phone3" },
  { header: "GebDatum", accessorKey: "birthDate" },
  { header: "Mitgliedstyp", accessorKey: "membershipType" },
  { header: "Status", accessorKey: "status" },
  { header: "Eintrittsdatum", accessorKey: "joinDate" },
  { header: "Datenweiterverwendung", accessorKey: "dataUsageConsent" },
  { header: "Zeitschriftenversand", accessorKey: "magazineDelivery" },
  { header: "Gruppierungsname", accessorKey: "groupName" },
  { header: "Gruppierungsnummer", accessorKey: "groupNumber" },
];
await getNamiMembers();
</script>

<style></style>
