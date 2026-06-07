<template>
  <div class="flex flex-col gap-4">
    <div class="flex lg:justify-between lg:items-center flex-col lg:flex-row gap-4">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Läger & Aktionen', to: '/events' },
          { label: shoppingList?.name ?? '...', to: `/events/${route.params.id}` },
          { label: 'Einkaufsliste' },
        ]"
      />
    </div>

    <UPageHeader v-if="shoppingList">
      <template #headline>
        <div class="flex justify-between w-full items-center gap-4">
          <h1 class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted">
            {{ shoppingList.name }}
          </h1>
          <div class="flex gap-4">
            <FormDrawer
              v-model:open="addOpen"
              title="Artikel hinzufügen"
              :loading="saving"
              :state="addState"
              trigger-icon="i-lucide-plus"
              @submit="onCreate"
              @close="resetAdd"
            >
              <template #trigger="{ open: openDrawer }">
                <UButton icon="i-lucide-plus" color="primary" @click="openDrawer" />
              </template>
              <ShoppinglistItemFields v-model="addState" />
            </FormDrawer>

            <DeleteConfirmModal
              title="Einkaufsliste löschen"
              description="Willst du diese Einkaufsliste wirklich löschen? Diese Aktion kann nicht mehr rückgängig gemacht werden."
              confirm-label="Löschen"
              @confirm="onDeleteList"
            >
              <UButton label="Liste löschen" color="error" icon="i-lucide-trash" />
            </DeleteConfirmModal>
          </div>
        </div>
      </template>
    </UPageHeader>

    <UTable
      v-if="items?.length"
      :data="items"
      :columns="columns"
      sticky
    >
      <template #checked-cell="{ row }">
        <UCheckbox
          :model-value="row.original.checked"
          @update:model-value="(val) => onToggleChecked(row.original, val)"
        />
      </template>

      <template #category-cell="{ row }">
        <UBadge v-if="row.original.category" variant="subtle" color="neutral">
          {{ row.original.category }}
        </UBadge>
        <span v-else class="text-muted">—</span>
      </template>

      <template #amount-cell="{ row }">
        <span v-if="row.original.amount">
          {{ row.original.amount }} {{ row.original.unit ?? "" }}
        </span>
        <span v-else class="text-muted">—</span>
      </template>

      <template #note-cell="{ row }">
        <span class="text-muted text-sm">{{ row.original.note || "—" }}</span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-1 items-center">
          <FormDrawer
            v-model:open="editOpen[row.original.id]"
            title="Artikel bearbeiten"
            :loading="saving"
            :state="editStates[row.original.id]"
            trigger-icon="i-lucide-pencil"
            @submit="() => onUpdate(row.original.id)"
            @close="() => delete editOpen[row.original.id]"
          >
            <template #trigger="{ open: openDrawer }">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openEdit(row.original)"
              />
            </template>
            <ShoppinglistItemFields v-model="editStates[row.original.id]" />
          </FormDrawer>

          <DeleteConfirmModal
            title="Artikel entfernen"
            description="Willst du diesen Artikel wirklich entfernen?"
            confirm-label="Entfernen"
            @confirm="(close) => onDelete(row.original.id, close)"
          />
        </div>
      </template>
    </UTable>

    <UEmpty
      v-else
      icon="i-lucide-shopping-cart"
      title="Noch nichts hier"
      description="Diese Einkaufsliste hat noch keine Artikel."
    >
      <template #actions>
        <FormDrawer
          v-model:open="addOpen"
          title="Artikel hinzufügen"
          :loading="saving"
          :state="addState"
          trigger-label="Artikel hinzufügen"
          trigger-icon="i-lucide-plus"
          @submit="onCreate"
          @close="resetAdd"
        >
          <ShoppinglistItemFields v-model="addState" />
        </FormDrawer>
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { ShoppinglistsitemsRecord, ShoppinglistsitemsResponse } from "~/../../shared/types/pocketbase";

definePageMeta({ middleware: ["auth"] });

const route = useRoute();
const router = useRouter();
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const listId = route.params.id as string;

const { data: shoppingList, refresh: refreshList } = await useAsyncData(
  `shoppinglist-${listId}`,
  () => pb.collection(Collections.Shoppinglists).getOne(listId),
);

const { data: items, refresh: refreshItems } = await useAsyncData(
  `shoppinglist-items-${listId}`,
  () =>
    pb.collection(Collections.Shoppinglistsitems).getFullList<ShoppinglistsitemsResponse>({
      filter: `list = "${listId}"`,
      sort: "category,name",
      requestKey: null,
    }),
);

useRealtimeRefresh("shoppinglistsitems", refreshItems);

const columns = [
  { accessorKey: "checked", header: "" },
  { accessorKey: "name", header: "Artikel" },
  { accessorKey: "category", header: "Kategorie" },
  { accessorKey: "amount", header: "Menge" },
  { accessorKey: "note", header: "Notiz" },
  { id: "actions", header: "" },
];

// --- Add ---
const addOpen = ref(false);
const saving = ref(false);

const emptyState = (): Omit<ShoppinglistsitemsRecord, "id" | "created" | "updated"> => ({
  name: "",
  amount: undefined,
  unit: undefined,
  category: undefined,
  note: "",
  checked: false,
  list: listId,
});

const addState = reactive(emptyState());

const resetAdd = () => Object.assign(addState, emptyState());

const onCreate = async () => {
  saving.value = true;
  try {
    await pb.collection(Collections.Shoppinglistsitems).create({ ...addState });
    toast.add({ title: "Artikel hinzugefügt", icon: "i-lucide-shopping-cart" });
    resetAdd();
    addOpen.value = false;
    await refreshItems();
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};

// --- Edit ---
const editOpen = reactive<Record<string, boolean>>({});
const editStates = reactive<Record<string, any>>({});

const openEdit = (item: ShoppinglistsitemsResponse) => {
  editStates[item.id] = { ...item };
  editOpen[item.id] = true;
};

const onUpdate = async (id: string) => {
  saving.value = true;
  try {
    await pb.collection(Collections.Shoppinglistsitems).update(id, editStates[id]);
    toast.add({ title: "Artikel gespeichert", icon: "i-lucide-save" });
    editOpen[id] = false;
    await refreshItems();
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};

// --- Toggle checked ---
const onToggleChecked = async (item: ShoppinglistsitemsResponse, val: boolean) => {
  try {
    await pb.collection(Collections.Shoppinglistsitems).update(item.id, { checked: val });
    await refreshItems();
  } catch (e: any) {
    toastError(e);
  }
};

// --- Delete item ---
const onDelete = async (id: string, close: () => void) => {
  try {
    await pb.collection(Collections.Shoppinglistsitems).delete(id);
    toast.add({ title: "Artikel entfernt", icon: "i-lucide-trash" });
    close();
    await refreshItems();
  } catch (e: any) {
    toastError(e);
  }
};

// --- Delete list ---
const onDeleteList = async (close: () => void) => {
  if (!shoppingList.value) return;
  try {
    await pb.collection(Collections.Shoppinglists).delete(shoppingList.value.id);
    toast.add({ title: "Liste gelöscht", icon: "i-lucide-trash" });
    close();
    router.push(`/events/${route.params.id}`);
  } catch (e: any) {
    toastError(e);
  }
};
</script>
