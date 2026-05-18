<template>
  <FormDrawer
    v-model:open="open"
    title="Neue Einkaufsliste"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UButton color="primary" icon="i-lucide-plus" @click="openDrawer" />
    </template>

    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
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

const onSubmit = async () => {
  loading.value = true;

  await pb.collection(Collections.Shoppinglists).create({ ...state });

  toast.add({
    title: "Einkaufsliste erstellt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  state.name = "";
  loading.value = false;
  open.value = false;
};

const onAbort = () => {
  state.name = "";
};
</script>
