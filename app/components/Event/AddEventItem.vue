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
      v-model:row-selection="rowSelection"
      :data="getFilterItems"
      :columns="columns"
    />
    <p v-else class="text-muted text-sm">Keine Materialien verfügbar.</p>
  </FormDrawer>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const emit = defineEmits(["refresh"]);
const props = defineProps({
  list: {
    type: Object as () => EventlistsRecord,
    required: true,
  },
});

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const table = useTemplateRef("table");

const { data: items, execute } = useAsyncData(
  () =>
    pb.collection(Collections.Items).getFullList<ItemsResponse>({
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
  loading.value = true;

  const selectedRows = table.value?.tableApi
    .getFilteredSelectedRowModel()
    .rows.map((row: TableRow<any>) => row.original.id);

  await pb.collection(Collections.Eventlists).update(props.list.id, {
    updatedBy: user.value?.id,
    items: [...(props.list.items || []), ...(selectedRows || [])],
  });

  toast.add({
    title: "Eintrag eingefügt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  loading.value = false;
  open.value = false;
};

const rowSelection = ref<Record<string, boolean>>({});

const getFilterItems = computed(
  () =>
    items.value?.filter(
      (item) => !(props.list.items || []).includes(item.id),
    ) || [],
);
</script>
