<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Mitglieder', to: '/members' },
      ]"
    />

    <div v-if="members?.length">
      <UPageHeader>
        <template #headline>
          <div class="flex justify-between w-full items-center gap-4">
            <h1
              class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted"
            >
              Mitglieder
            </h1>
            <CreateMember @refresh="getNamiMembers()" />
          </div>
        </template>
        <template #description>
          <p class="mt-4">
            Hier findest du alle NaMi Mitglieder die importiert wurden. <br />
            Sollte die Liste leer sein, importiere eine NaMi Excel Datei in den
            <ULink inactive-class="text-primary font-semibold" to="/settings">
              Einstellungen
            </ULink>
            (nur für Admins verfügbar) – oder lege Mitglieder manuell über
            <span class="font-semibold">„Mitglied anlegen"</span> an.
          </p>
        </template>
      </UPageHeader>

      <div class="mt-8">
        <div class="flex flex-col flex-1 w-full">
          <div class="flex pb-4 border-b border-accented">
            <UInput
              v-model="globalFilter"
              size="xl"
              class="w-full"
              placeholder="Suche..."
            />
          </div>

          <UTable
            ref="table"
            v-model:column-pinning="columnPinning"
            v-model:global-filter="globalFilter"
            sticky
            class="max-h-225"
            :data="members"
            :columns="columns"
          >
            <template #ranks-cell="{ row }">
              <div
                v-if="row.original.expand?.ranks?.length"
                class="flex flex-wrap gap-1"
              >
                <RankBadge
                  v-for="rank in row.original.expand.ranks"
                  :key="rank.id"
                  :name="rank.name"
                  :colour="rank.colour"
                />
              </div>
              <span v-else class="text-muted text-sm">—</span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-1 items-center">
                <EditMember
                  :member="row.original"
                  @refresh="getNamiMembers()"
                />
                <DeleteConfirmModal
                  title="Mitglied löschen"
                  :description="`Soll ${row.original.firstName ?? ''} ${row.original.lastName ?? ''} wirklich gelöscht werden?`"
                  confirm-label="Mitglied löschen"
                  @confirm="(close: () => void) => onDeleteMember(row, close)"
                />
              </div>
            </template>
          </UTable>
        </div>
      </div>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-file"
      title="Malheur!"
      description="Diese Liste scheint noch keine Einträge zu haben."
    >
      <template #actions>
        <CreateMember @refresh="getNamiMembers()" />
        <UButton
          icon="i-lucide-refresh-cw"
          label="Aktualisieren"
          color="neutral"
          @click="getNamiMembers()"
        />
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const members = ref<any[]>([]);
const globalFilter = ref("");
const columnPinning = ref({ right: ["actions"] });

const getNamiMembers = async () => {
  members.value = await pb.collection(Collections.Members).getFullList({
    expand: "ranks",
  });
};

useRealtimeRefresh([Collections.Members, Collections.Ranks], getNamiMembers);

const columns: TableColumn<any>[] = [
  { header: "Mitgliedsnummer", accessorKey: "memberNumber" },
  { header: "Vorname", accessorKey: "firstName" },
  { header: "Nachname", accessorKey: "lastName" },
  { header: "Stufen", accessorKey: "ranks" },
  { header: "Geschlecht", accessorKey: "gender" },
  { header: "Staatsangehörigkeit", accessorKey: "nationality" },
  { header: "Straße", accessorKey: "street" },
  { header: "PLZ", accessorKey: "postalCode" },
  { header: "Ort", accessorKey: "city" },
  { header: "E-Mail", accessorKey: "email" },
  { header: "E-Mail (Erziehungsber.)", accessorKey: "parentEmail" },
  { header: "Telefon 1", accessorKey: "phone1" },
  { header: "Telefon 2", accessorKey: "phone2" },
  { header: "Telefon 3", accessorKey: "phone3" },
  { header: "Geburtsdatum", accessorKey: "birthdate" },
  { header: "Mitgliedstyp", accessorKey: "membershipType" },
  { header: "Status", accessorKey: "status" },
  { header: "Eintrittsdatum", accessorKey: "joinDate" },
  { header: "Datenweiterverwendung", accessorKey: "dataUsageConsent" },
  { header: "Zeitschriftenversand", accessorKey: "magazineDelivery" },
  { header: "Gruppierungsname", accessorKey: "groupName" },
  { header: "Gruppierungsnummer", accessorKey: "groupNumber" },
  { header: "", accessorKey: "actions" },
];

const onDeleteMember = async (row: any, close: () => void) => {
  try {
    await pb.collection(Collections.Members).delete(row.original.id);
    toast.add({ title: "Mitglied gelöscht", icon: "i-lucide-trash" });
    close();
    await getNamiMembers();
  } catch (error: any) {
    toastError(error);
  }
};

await getNamiMembers();
</script>
