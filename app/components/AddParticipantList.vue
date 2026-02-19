<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton color="success" @click="open = true" icon="i-lucide-plus" />

    <template #body>
      <div class="flex flex-col p-4 lg:min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Neue Teilnehmerliste</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm :state="state" class="mt-4 flex flex-col gap-4">
          <UInput size="lg" v-model="state.name" placeholder="Listen Name...">
          </UInput>
          <USeparator class="h-4"></USeparator>
          <UInput
            v-model="globalFilter"
            class="w-full"
            placeholder="Suche..."
          />
          <UTable
            class="max-h-120"
            @select="onSelect"
            v-model:row-selection="rowSelection"
            ref="table"
            :data="members"
            :columns="columns"
            v-model:global-filter="globalFilter"
          >
          </UTable>

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

const emit = defineEmits(["refresh"]);
const props = defineProps(["eventId"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const state = reactive({
  name: "",
  event: props.eventId,
});

const table = useTemplateRef("table");

const {
  data: members,
  refresh,
  execute,
} = await useAsyncData<any>(
  () => pb.collection("members").getFullList({ requestKey: null }),
  { immediate: false },
);

const globalFilter = ref("");

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

const onSubmit = async () => {
  loading.value = true;

  const record = await pb.collection("participantlists").create(state);

  try {
    const batch = pb.createBatch();

    table.value?.tableApi
      .getFilteredSelectedRowModel()
      .rows.forEach((element) => {
        const m = members.value[element.index];

        if (!m) return;
        batch
          .collection("members")
          .update(m.id, { ...m, lists: [...m.lists, record.id] });
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

  members.value = null;

  loading.value = false;
  open.value = false;
};

const onAbort = async () => {
  members.value = null;
  open.value = false;
};

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(e: Event, row: TableRow<any>) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected());
}
</script>
