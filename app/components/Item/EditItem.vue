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

const state = reactive({ ...props.item });

watch(
  () => props.item,
  (next) => Object.assign(state, next),
  { deep: true },
);

const onSubmit = async () => {
  loading.value = true;

  try {
    await pb.collection("items").update(props.item.id, state);
    await pb
      .collection("lists")
      .update(props.listId, { updatedBy: user.value?.id });

    toast.add({ title: "Eintrag aktualisiert", icon: "i-lucide-save" });

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
