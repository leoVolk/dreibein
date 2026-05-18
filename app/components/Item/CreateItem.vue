<template>
  <FormDrawer
    v-model:open="open"
    title="Material hinzufügen"
    trigger-label="Material hinzufügen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
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

const emit = defineEmits(["refresh"]);
const props = defineProps({
  list: {
    type: Object as () => ListsRecord,
    required: true,
  },
});

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const statusOptions = [
  { label: "Intakt", value: "none" },
  { label: "Beschädigt", value: "damaged" },
  { label: "In Reparatur", value: "repair" },
  { label: "In Benutzung", value: "checkedOut" },
];

const initialState = () => ({
  checkout: "",
  description: "",
  name: "",
  quantity: 0,
  status: "none",
  weight: 0,
});

const state = reactive(initialState());

const onSubmit = async () => {
  loading.value = true;

  const item = await pb
    .collection<ItemsResponse>(Collections.Items)
    .create(state);

  await pb.collection(Collections.Lists).update(props.list.id, {
    updatedBy: user.value?.id,
    items: [...(props.list.items || []), item.id],
  });

  toast.add({
    title: "Eintrag eingefügt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  Object.assign(state, initialState());

  loading.value = false;
  open.value = false;
};

const onAbort = () => {
  Object.assign(state, initialState());
};
</script>
