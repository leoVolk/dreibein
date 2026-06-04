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
        ref="table"
        @select="onSelect"
        sticky
        v-model:column-pinning="columnPinning"
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
          />

          <UButton
            icon="i-lucide-info"
            color="info"
            variant="ghost"
            aria-label="Actions"
          />
        </template>
      </UTable>
    </div>
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

const table = useTemplateRef("table");

const rowSelection = ref<Record<string, boolean>>({});

const columnPinning = ref({ right: ["actions"] });

function onSelect(e: Event, row: TableRow<any>) {
  /* If you decide to also select the column you can do this  */
  // row.toggleSelected(!row.getIsSelected());
}

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

const { data: selectedMember, pending: selectionPending } = useAsyncData(
  "member-data",
  () => pb.send(`/api/nami/members/${"310471"}`, { method: "GET" }),
);
</script>
