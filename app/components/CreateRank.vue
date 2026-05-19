<template>
  <FormDrawer
    v-model:open="open"
    title="Neue Stufe anlegen"
    trigger-label="Stufe anlegen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>

    <UFormField class="w-full" label="Farbe" name="colour">
      <div class="flex items-center gap-3">
        <input
          v-model="state.colour"
          type="color"
          class="size-10 rounded border border-default cursor-pointer bg-transparent p-0"
          aria-label="Farbe wählen"
        />
        <UInput
          v-model="state.colour"
          size="lg"
          class="flex-1"
          placeholder="#3b82f6"
        />
      </div>
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const initialState = () => ({
  name: "",
  colour: "#3b82f6",
});

const state = reactive(initialState());

const onSubmit = async () => {
  loading.value = true;

  try {
    await pb.collection("ranks").create({ ...state });

    toast.add({ title: "Stufe angelegt", icon: "i-lucide-save" });

    emit("refresh");
    Object.assign(state, initialState());
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, initialState());
};
</script>
