<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton icon="i-lucide-plus" @click="open = true"
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

        <UForm class="mt-4 flex flex-col gap-4">
          <UTable
            v-model:row-selection="rowSelection"
            ref="table"
            :data="mappedItems"
            :columns="columns"
          >
            <template #quantity-cell="{ row }">
              <UInputNumber
                :min="0"
                v-model="mappedItems[row.index].quantity"
              ></UInputNumber> </template
          ></UTable>

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
              color="success"
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
const props = defineProps(["listId", "itemsInList"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const table = useTemplateRef("table");
const items = await pb.collection("items").getFullList({ requestKey: null });

const mappedItems = ref();

mappedItems.value = items
  .filter((i) => {
    return !!props.itemsInList
      ? !props.itemsInList.find((item: any) => item.refItem === i.id)
      : true;
  })
  .map((i) => {
    return {
      name: i.name,
      list: props.listId,
      quantity: i.quantity,
      weight: i.weight,
      status: i.status,
      refItem: i.id,
    };
  });

const UCheckbox = resolveComponent("UCheckbox");

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
  { header: "Name", accessorKey: "name" },
  { header: "Anzahl", accessorKey: "quantity" },
  {
    header: "Gewicht (kg)",
    accessorKey: "weight",
    cell: ({ row }) => `${row.getValue("weight")} kg`,
  },
];

const onSubmit = async () => {
  loading.value = true;

  const batch = pb.createBatch();

  table.value?.tableApi
    .getFilteredSelectedRowModel()
    .rows.forEach((element) => {
      batch.collection("eventitems").create(mappedItems.value[element.index]);
    });

  const result = await batch.send();

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
</script>
