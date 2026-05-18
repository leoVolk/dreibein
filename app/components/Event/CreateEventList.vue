<template>
  <FormDrawer
    v-model:open="open"
    title="Neue Liste erstellen"
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
const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

const router = useRouter();
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

  const record = await pb
    .collection("eventlists")
    .create({ ...state, createdBy: user.value?.id });

  toast.add({
    title: "Liste erstellt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  loading.value = false;
  open.value = false;

  router.push(`/events/${props.eventId}/lists/${record.id}`);
};

const onAbort = () => {
  state.name = "";
};
</script>
