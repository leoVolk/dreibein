<template>
  <FormDrawer
    v-model:open="open"
    title="Liste bearbeiten"
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
        color="primary"
        @click="openDrawer"
      />
    </template>

    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

const props = defineProps(["list"]);
const emit = defineEmits(["refresh"]);

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const state = reactive({
  name: props.list.name,
});

const onSubmit = async () => {
  loading.value = true;

  await pb
    .collection("lists")
    .update(props.list.id, { ...state, updatedBy: user.value?.id });

  toast.add({
    title: "Liste aktualisiert",
    icon: "i-lucide-save",
  });

  emit("refresh");

  loading.value = false;
  open.value = false;
};

const onAbort = () => {
  state.name = props.list.name;
};
</script>
