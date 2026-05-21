<template>
  <FormDrawer
    v-model:open="open"
    title="Kategorie bearbeiten"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UTooltip text="Kategorie bearbeiten">
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
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const props = defineProps<{
  category: ItemcategoriesResponse;
}>();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const state = reactive({ name: props.category.name });

watch(
  () => props.category,
  (next) => {
    state.name = next.name;
  },
  { deep: true },
);

const onSubmit = async () => {
  loading.value = true;

  try {
    await pb.collection(Collections.Itemcategories).update(props.category.id, {
      name: state.name,
    });

    toast.add({ title: "Kategorie aktualisiert", icon: "i-lucide-save" });

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  state.name = props.category.name;
};
</script>
