<template>
  <FormDrawer
    v-model:open="open"
    title="Stufe bearbeiten"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UTooltip text="Stufe bearbeiten">
        <UButton
          variant="ghost"
          size="sm"
          color="primary"
          icon="i-lucide-pencil"
          @click="openDrawer"
        />
      </UTooltip>
    </template>

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

const props = defineProps<{
  rank: { id: string; name: string; colour: string };
}>();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const state = reactive({
  name: props.rank.name,
  colour: props.rank.colour,
});

watch(
  () => props.rank,
  (next) => {
    state.name = next.name;
    state.colour = next.colour;
  },
  { deep: true },
);

const onSubmit = async () => {
  loading.value = true;

  try {
    await pb.collection("ranks").update(props.rank.id, {
      name: state.name,
      colour: state.colour,
    });

    toast.add({ title: "Stufe aktualisiert", icon: "i-lucide-save" });

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  state.name = props.rank.name;
  state.colour = props.rank.colour;
};
</script>
