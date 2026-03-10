<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton color="primary" icon="i-lucide-plus" @click="open = true"
      >Material hinzufügen</UButton
    >

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Material hinzufügen</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm v-if="items?.length" class="mt-4 flex flex-col gap-4">
          <UTable
            v-model:row-selection="rowSelection"
            ref="table"
            :data="getFilterItems"
            :columns="columns"
          >
            ></UTable
          >

          <div class="flex gap-4">
            <UButton
              @click="onAbort"
              size="lg"
              class="w-full justify-center"
              color="error"
              icon="i-lucide-save"
            >
              Abbrechen
            </UButton>
            <UButton
              :loading="loading"
              @click="onSubmit"
              size="lg"
              class="w-full justify-center"
              color="primary"
              icon="i-lucide-save"
            >
              Speichern
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UDrawer>
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

const {
  data: items,
  execute,
  refresh,
} = useAsyncData(
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

watch(open, async (newOpen, oldOpen) => {
  if (newOpen === true) {
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

const onAbort = async () => {
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
