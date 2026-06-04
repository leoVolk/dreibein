<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Mitglieder', to: '/members' },
      ]"
    />

    <UPageHeader title="Alle Mitglieder" />

    <UEmpty
      v-if="!isConfigured"
      icon="i-lucide-key-round"
      title="NaMi Integration nicht eingerichtet"
    >
      <template #description>
        <p>
          Die NaMi Integration wurde nicht oder nur teilweise eingerichtet.
          <br />
          Um die NaMi Integration zu nutzen, bitte hinterlege valide NaMi Daten
          in
          <NuxtLink to="settings" class="text-primary underline"
            >den Einstellung</NuxtLink
          >
        </p>
      </template>
    </UEmpty>

    <div>
      <UInput
        v-model="search"
        class="w-full mb-4"
        placeholder="Suche..."
        size="xl"
      />

      <UTable
        v-if="isConfigured"
        :loading="membersPending"
        :data="filteredNamiMembers || []"
        :columns="columns"
        class="flex-1"
        sticky
        v-model:row-selection="rowSelection"
        v-model:column-pinning="columnPinning"
        :meta="tableMeta"
      >
        <template #empty>
          <UButton
            variant="ghost"
            :loading="membersPending"
            loading-icon="i-lucide-loader-circle"
          ></UButton>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-list-plus"
            color="primary"
            variant="ghost"
            aria-label="Actions"
            @click="onMemberListClicked(row)"
          />

          <UButton
            icon="i-lucide-info"
            color="info"
            variant="ghost"
            aria-label="Actions"
            @click="onMemberInfoClick(row)"
          />
        </template>
      </UTable>
    </div>

    <NamiMemberDrawer v-model:open="drawerOpen" :nami-id="selectedNamiId" />
    <AddToEventModal
      v-if="selectedMember"
      v-model:open="addModalOpen"
      :member="selectedMember"
    />
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const tableMeta = useTableMeta();

const settingsId = ref<string | null>(null);
const credentials = reactive({
  namiUsername: "",
  namiPassword: "",
  namiGroupId: "",
});

const isConfigured = computed(
  () =>
    !!(
      credentials.namiUsername &&
      credentials.namiPassword &&
      credentials.namiGroupId
    ),
);

const rowSelection = ref<Record<string, boolean>>({});
const columnPinning = ref({ right: ["actions"] });
const drawerOpen = ref(false);
const selectedNamiId = ref<number | null>(null);
const addModalOpen = ref(false);
const selectedMember = ref<any>(null);

const onMemberListClicked = (row: TableRow<any>) => {
  selectedMember.value = row.original;
  addModalOpen.value = true;
};

const onMemberInfoClick = (row: TableRow<any>) => {
  selectedNamiId.value = row.original.entries_id ?? row.original.id ?? null;
  drawerOpen.value = true;
};

const { data: namiSettings } = await useAsyncData("nami-settings", () =>
  pb
    .collection(Collections.Settings)
    .getFirstListItem('integration = "nami"')
    .catch(() => null),
);

if (namiSettings.value) {
  settingsId.value = namiSettings.value.id;
  credentials.namiUsername = (namiSettings.value as any).namiUsername ?? "";
  credentials.namiPassword = (namiSettings.value as any).namiPassword ?? "";
  credentials.namiGroupId = (namiSettings.value as any).namiGroupId ?? "";
}

const columns: TableColumn<any>[] = [
  { header: "Mitgliedernummer", accessorKey: "entries_mitgliedsNummer" },
  { header: "Nachname", accessorKey: "entries_nachname" },
  { header: "Vorname", accessorKey: "entries_vorname" },
  { header: "Stufe", accessorKey: "entries_stufe" },
  { header: "Status", accessorKey: "entries_status" },
  { header: "Typ", accessorKey: "entries_mglType" },
  { header: "Geschlecht", accessorKey: "entries_geschlecht" },
  {
    header: "Geburtsdatum",
    accessorKey: "entries_geburtsDatum",
    cell: ({ row }) => row.original.entries_geburtsDatum?.slice(0, 10) ?? "",
  },
  {
    header: "Eintrittsdatum",
    accessorKey: "entries_eintrittsdatum",
    cell: ({ row }) => row.original.entries_eintrittsdatum?.slice(0, 10) ?? "",
  },
  { header: "E-Mail", accessorKey: "entries_email" },
  {
    header: "E-Mail Erziehungsberechtigter",
    accessorKey: "entries_emailVertretungsberechtigter",
  },
  { header: "", id: "actions" },
];

const { data: namiMembers, pending: membersPending } = useAsyncData(
  "nami-members",
  () => pb.send("/api/nami/members", { method: "GET" }),
  {
    transform: (res) => res.items,
    getCachedData(key, nuxtApp, context) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const search = ref("");

const filteredNamiMembers = computed(() => {
  const q = search.value.trim().toLowerCase();
  return namiMembers?.value
    ?.filter(
      (i: any) =>
        i.entries_mglType === "Mitglied" && i.entries_status === "Aktiv",
    )
    .filter((i: any) => {
      if (!q) return true;
      return (
        String(i.entries_mitgliedsNummer ?? "").includes(q) ||
        (i.entries_vorname ?? "").toLowerCase().includes(q) ||
        (i.entries_nachname ?? "").toLowerCase().includes(q) ||
        (i.entries_email ?? "").toLowerCase().includes(q) ||
        (i.entries_stufe ?? "").toLowerCase().includes(q)
      );
    });
});
</script>
