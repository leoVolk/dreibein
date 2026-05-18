<template>
  <FormDrawer
    v-model:open="open"
    title="Neue Liste erstellen"
    trigger-label="Liste erstellen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
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

const toast = useToast();
const open = ref(false);
const loading = ref(false);

const state = reactive({
  name: "",
});

const onSubmit = async () => {
  loading.value = true;

  const record = await pb
    .collection("lists")
    .create({ ...state, createdBy: user.value?.id });

  toast.add({
    title: "Liste erstellt",
    icon: "i-lucide-save",
  });

  emit("refresh");

  loading.value = false;
  open.value = false;

  router.push(`/lists/${record.id}`);
};

const onAbort = () => {
  state.name = "";
};
</script>
