<template>
  <FormDrawer
    v-model:open="open"
    title="Material hinzufügen"
    trigger-label="Material hinzufügen"
    :loading="loading"
    @submit="onSubmit"
  >
    <UTable
      v-if="items?.length"
      ref="table"
      sticky
      v-model:row-selection="rowSelection"
      :data="items ?? []"
      :columns="columns"
    />
    <p v-else class="text-muted text-sm">Keine Materialien verfügbar.</p>
  </FormDrawer>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

const { pb } = usePocketbase();

const emit = defineEmits(["refresh"]);
const props = defineProps({
  list: {
    type: Object as () => EventlistsRecord,
    required: true,
  },
});

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const table = useTemplateRef("table");

const { data: items, execute } = useAsyncData(
  () =>
    pb.collection(Collections.Items).getFullList<ItemsResponse>({
      filter: `list != "" && eventlists !~ "${props.list.id}"`,
      expand: "category",
      sort: "name",
      requestKey: null,
    }),
  { immediate: false },
);
const UCheckbox = resolveComponent("UCheckbox");

const columns: TableColumn<ItemsRecord>[] = [
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
  { header: "Name", accessorKey: "name" },
  { header: "Anzahl", accessorKey: "quantity" },
  {
    header: "Gewicht (kg)",
    accessorKey: "weight",
    cell: ({ row }) => `${row.getValue("weight")} kg`,
  },
];

watch(open, (newOpen) => {
  if (newOpen) {
    execute();
    rowSelection.value = {};
  }
});

const onSubmit = async () => {
  const selectedRows = table.value?.tableApi
    ?.getSelectedRowModel()
    .rows.map((row: TableRow<any>) => row.original.id) ?? [];

  if (!selectedRows.length) {
    toast.add({
      color: "warning",
      title: "Keine Materialien ausgewählt",
      icon: "i-lucide-triangle-alert",
    });
    return;
  }

  loading.value = true;

  try {
    await Promise.all(
      selectedRows.map((itemId: string) =>
        pb.collection(Collections.Items).update(itemId, {
          "eventlists+": props.list.id,
        }),
      ),
    );

    toast.add({
      title: `${selectedRows.length} Material(ien) hinzugefügt`,
      icon: "i-lucide-save",
    });

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const rowSelection = ref<Record<string, boolean>>({});
</script>
