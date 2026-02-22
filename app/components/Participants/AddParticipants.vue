<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton
      @click="open = true"
      label="Teilnehmer hinzufügen"
      icon="i-lucide-plus"
    />

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Teilnehmer hinzufügen</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm class="mt-4 flex flex-col gap-4 max-h-220">
          <UInput
            v-model="globalFilter"
            class="w-full"
            placeholder="Suche..."
          />
          <UTable
            @select="onSelect"
            ref="table"
            :columns="columns"
            :data="participants"
            sticky
            :global-filter="globalFilter"
          />

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
const route = useRoute();

const emit = defineEmits(["refresh"]);

const open = ref(false);
const toast = useToast();

const UCheckbox = resolveComponent("UCheckbox");
const table = useTemplateRef("table");

const {
  data: participants,
  refresh: refreshParticipants,
  execute,
} = await useAsyncData<any>(
  () =>
    pb.collection("members").getFullList({
      filter: `lists !~ "${route.params.listId}"`,
      requestKey: null,
    }),
  { immediate: false },
);

const globalFilter = ref("");

watch(open, async (newOpen, oldOpen) => {
  if (newOpen === true) execute();
});

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(e: Event, row: TableRow<any>) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected());
}

const onSubmit = async () => {
  try {
    const batch = pb.createBatch();

    table.value?.tableApi.getFilteredSelectedRowModel().rows.forEach((row) => {
      const m = participants.value[row.index];

      if (!m) return;
      batch
        .collection("members")
        .update(m.id, { ...m, lists: [...m.lists, route.params.listId] });
    });

    const result = await batch.send();
  } catch (error: any) {
    toast.add({
      color: "error",
      title: error,
      icon: "i-lucide-error",
    });
  }

  toast.add({
    title: "Eintrag eingefügt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  participants.value = null;

  open.value = false;
};

const onAbort = async () => {
  participants.value = null;
  open.value = false;
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
  {
    header: "EMailErziehungsberechtigter",
    accessorKey: "guardianEmail",
  },
  { header: "Telefon1", accessorKey: "phone1" },
  { header: "Telefon2", accessorKey: "phone2" },
  { header: "Telefon3", accessorKey: "phone3" },
];
</script>

<style></style>
