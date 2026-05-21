<template>
  <FormDrawer
    v-model:open="open"
    title="Neue Teilnehmerliste"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UButton color="primary" icon="i-lucide-plus" @click="openDrawer" />
    </template>

    <UInput v-model="state.name" size="lg" placeholder="Listen Name..." />
    <USeparator class="h-4" />
    <UInput v-model="globalFilter" class="w-full" placeholder="Suche..." />
    <UTable
      ref="table"
      v-model:row-selection="rowSelection"
      v-model:global-filter="globalFilter"
      class="max-h-120"
      sticky
      :data="members ?? []"
      :columns="columns"
      @select="onSelect"
    />
  </FormDrawer>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

const { pb } = usePocketbase();

const emit = defineEmits(["refresh"]);
const props = defineProps(["eventId"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const UCheckbox = resolveComponent("UCheckbox");

const state = reactive({
  name: "",
  event: props.eventId,
});

const table = useTemplateRef("table");

const { data: members, execute } = await useAsyncData<any>(
  () => pb.collection("members").getFullList({ requestKey: null }),
  { immediate: false },
);

const globalFilter = ref("");

watch(open, (newOpen) => {
  if (newOpen) execute();
});

const columns: TableColumn<any>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
  },
  { header: "Mitgliedsnummer", accessorKey: "memberNumber" },
  { header: "Vorname", accessorKey: "firstName" },
  { header: "Nachname", accessorKey: "lastName" },
  { header: "Strasse", accessorKey: "street" },
  { header: "PLZ", accessorKey: "postalCode" },
  { header: "Ort", accessorKey: "city" },
  { header: "EMail", accessorKey: "email" },
  { header: "EMailErziehungsberechtigter", accessorKey: "guardianEmail" },
  { header: "Telefon1", accessorKey: "phone1" },
  { header: "Telefon2", accessorKey: "phone2" },
  { header: "Telefon3", accessorKey: "phone3" },
];

const onSubmit = async () => {
  const selectedRows =
    table.value?.tableApi?.getSelectedRowModel().rows ?? [];

  if (!selectedRows.length) {
    toast.add({
      color: "warning",
      title: "Keine Teilnehmer ausgewählt",
      icon: "i-lucide-triangle-alert",
    });
    return;
  }

  loading.value = true;

  try {
    const record = await pb.collection("participantlists").create(state);

    const batch = pb.createBatch();

    selectedRows.forEach((row) => {
      const m = row.original;
      if (!m?.id) return;
      batch.collection("members").update(m.id, {
        lists: [...(m.lists ?? []), record.id],
      });
    });

    await batch.send();

    toast.add({
      title: `Teilnehmerliste erstellt (${selectedRows.length} Mitglieder)`,
      icon: "i-lucide-save",
    });

    emit("refresh");
    members.value = null;
    open.value = false;
  } catch (error: any) {
    toast.add({
      color: "error",
      title: error?.message ?? "Fehler",
      icon: "i-lucide-triangle-alert",
    });
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  members.value = null;
};

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(_e: Event, row: TableRow<any>) {
  row.toggleSelected(!row.getIsSelected());
}
</script>
