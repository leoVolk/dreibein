<template>
  <FormDrawer
    v-model:open="open"
    title="Teilnehmer hinzufügen"
    trigger-label="Teilnehmer hinzufügen"
    :loading="loading"
    @submit="onSubmit"
    @close="onAbort"
  >
    <UInput v-model="globalFilter" class="w-full" placeholder="Suche..." />
    <UTable
      ref="table"
      :columns="columns"
      :data="participants ?? []"
      class="max-h-220"
      sticky
      :global-filter="globalFilter"
      @select="onSelect"
    />
  </FormDrawer>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

const { pb } = usePocketbase();
const route = useRoute();

const emit = defineEmits(["refresh"]);

const open = ref(false);
const loading = ref(false);
const toast = useToast();

const UCheckbox = resolveComponent("UCheckbox");
const table = useTemplateRef("table");

const { data: participants, execute } = await useAsyncData<any>(
  () =>
    pb.collection("members").getFullList({
      filter: `lists !~ "${route.params.listId}"`,
      requestKey: null,
    }),
  { immediate: false },
);

const globalFilter = ref("");

watch(open, (newOpen) => {
  if (newOpen) execute();
});

function onSelect(_e: Event, row: TableRow<any>) {
  row.toggleSelected(!row.getIsSelected());
}

const onSubmit = async () => {
  loading.value = true;

  try {
    const batch = pb.createBatch();

    table.value?.tableApi.getFilteredSelectedRowModel().rows.forEach((row) => {
      const m = participants.value[row.index];

      if (!m) return;
      batch
        .collection("members")
        .update(m.id, { ...m, lists: [...m.lists, route.params.listId] });
    });

    await batch.send();

    toast.add({
      title: "Eintrag eingefügt",
      icon: "i-lucide-save",
    });

    emit("refresh");
    participants.value = null;
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
  participants.value = null;
};

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
</script>
