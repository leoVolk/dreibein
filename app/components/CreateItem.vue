<template>
  <UDrawer :open="open" direction="right" :handle="false" :dismissible="false">
    <UButton icon="i-lucide-plus" @click="open = true"
      >Material hinzufügen</UButton
    >

    <template #body>
      <div class="flex flex-col p-4 min-w-2xl max-w-2xl w-full">
        <div class="flex justify-between">
          <span class="text-2xl">Material hinzufügen</span>
          <UIcon
            @click="open = false"
            name="i-lucide-x"
            class="size-8 cursor-pointer"
          ></UIcon>
        </div>

        <UForm class="mt-4 flex flex-col gap-4" :state="state">
          <div class="flex gap-4">
            <UFormField class="w-full" label="Name" name="name">
              <UInput size="lg" class="w-full" v-model="state.name" />
            </UFormField>

            <UFormField class="w-full" label="Status" name="status">
              <USelect
                size="lg"
                v-model="state.status"
                :items="status"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField class="w-full" label="Beschreibung" name="description">
            <UTextarea
              size="lg"
              class="w-full"
              :rows="8"
              v-model="state.description"
            />
          </UFormField>

          <div class="flex gap-4">
            <UFormField class="w-full" label="Menge" name="quantity">
              <UInput
                size="lg"
                type="number"
                class="w-full"
                v-model="state.quantity"
              />
            </UFormField>

            <UFormField class="w-full" label="Gewicht (kg)" name="weight">
              <UInput
                size="lg"
                type="number"
                class="w-full"
                v-model="state.weight"
              />
            </UFormField>
            <UFormField
              class="w-full"
              label="In Benutzung seit:"
              name="checkout"
            >
              <UInput type="date" class="w-full" v-model="state.checkout" />
            </UFormField>
          </div>

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
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const emit = defineEmits(["refresh"]);
const props = defineProps(["listId"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const status = ref([
  {
    label: "Intakt",
    value: "none",
  },
  {
    label: "Beschädigt",
    value: "damaged",
  },
  {
    label: "In Reperatur",
    value: "repair",
  },
  {
    label: "In Benutzung",
    value: "checkedOut",
  },
]);

const state = reactive({
  checkout: "",
  description: "",
  id: "",
  image: null,
  name: "",
  quantity: 0,
  status: "none",
  weight: 0,
  list: props.listId,
});

const onSubmit = async () => {
  loading.value = true;

  await pb.collection("items").create(state);
  await pb
    .collection("lists")
    .update(props.listId, { updatedBy: user.value?.id });

  toast.add({
    title: "Eintrag eingefügt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  Object.assign(state, {
    checkout: "",
    description: "",
    id: "",
    image: null,
    name: "",
    quantity: 0,
    status: "none",
    weight: 0,
    list: props.listId,
  });

  loading.value = false;
  open.value = false;
};

const onAbort = async () => {
  open.value = false;
};
</script>
