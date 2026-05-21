<template>
  <FormDrawer
    v-model:open="open"
    :title="`${item.name} bearbeiten`"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UButton
        variant="ghost"
        size="sm"
        icon="i-lucide-edit"
        @click="openDrawer"
      />
    </template>

    <div class="flex gap-4 lg:row flex-col">
      <UFormField class="w-full" label="Name" name="name">
        <UInput v-model="state.name" size="lg" class="w-full" />
      </UFormField>

      <UFormField class="w-full" label="Status" name="status">
        <USelect
          v-model="state.status"
          size="lg"
          :items="statusOptions"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField class="w-full" label="Beschreibung" name="description">
      <UTextarea
        v-model="state.description"
        size="lg"
        class="w-full"
        :rows="8"
      />
    </UFormField>

    <UFormField class="w-full" label="Kategorie" name="category">
      <div class="flex gap-2">
        <USelectMenu
          v-model="state.category"
          :items="categoryOptions"
          value-key="value"
          size="lg"
          class="flex-1"
          placeholder="Keine Kategorie"
        />
        <UButton
          v-if="state.category"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="lg"
          @click="state.category = ''"
        />
      </div>
    </UFormField>

    <UFormField class="w-full" label="Übergeordnetes Material" name="parent">
      <div class="flex gap-2">
        <USelectMenu
          v-model="state.parent"
          :items="parentOptions"
          value-key="value"
          size="lg"
          class="flex-1"
          placeholder="Kein übergeordnetes Material"
        />
        <UButton
          v-if="state.parent"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="lg"
          @click="state.parent = ''"
        />
      </div>
    </UFormField>

    <div class="flex gap-4 lg:row flex-col">
      <UFormField class="w-full" label="Menge" name="quantity">
        <UInput
          v-model="state.quantity"
          size="lg"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField class="w-full" label="Gewicht (kg)" name="weight">
        <UInput
          v-model="state.weight"
          size="lg"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField class="w-full" label="In Benutzung seit:" name="checkout">
        <UInput v-model="state.checkout" type="date" class="w-full" />
      </UFormField>
    </div>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const props = defineProps(["item", "listId"]);
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const statusOptions = [
  { label: "Intakt", value: "none" },
  { label: "Beschädigt", value: "damaged" },
  { label: "In Reparatur", value: "repair" },
  { label: "In Benutzung", value: "checkedOut" },
];

const { data: allItems, refresh: refreshParentItems } = await useAsyncData("items-for-parent", () =>
  pb.collection(Collections.Items).getFullList<ItemsResponse>({ sort: "name", requestKey: null }),
);

const parentOptions = computed(() =>
  (allItems.value ?? [])
    .filter((i) => i.id !== props.item.id)
    .map((i) => ({ label: i.name || i.id, value: i.id })),
);

const { data: allCategories } = await useAsyncData("itemcategories-all", () =>
  pb.collection(Collections.Itemcategories).getFullList<ItemcategoriesResponse>({ sort: "name", requestKey: null }),
);

const categoryOptions = computed(() =>
  (allCategories.value ?? []).map((c) => ({ label: c.name || c.id, value: c.id })),
);

const state = reactive({ ...props.item });

watch(
  () => props.item,
  (next) => Object.assign(state, next),
  { deep: true },
);

const onSubmit = async () => {
  loading.value = true;

  try {
    await pb.collection(Collections.Items).update(props.item.id, state);
    if (props.listId) {
      await pb
        .collection(Collections.Lists)
        .update(props.listId, { updatedBy: user.value?.id });
    }

    toast.add({ title: "Eintrag aktualisiert", icon: "i-lucide-save" });

    refreshParentItems();
    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, props.item);
};
</script>
