<template>
  <FormDrawer
    v-model:open="open"
    title="Benutzer bearbeiten"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UTooltip text="Benutzer bearbeiten">
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

    <UFormField class="w-full" label="E-Mail" name="email">
      <UInput v-model="state.email" type="email" size="lg" class="w-full" />
    </UFormField>

    <RankSelectField v-model="state.ranks" />

    <UFormField name="admin">
      <UCheckbox v-model="state.admin" label="Admin" />
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();

const props = defineProps<{
  user: {
    id: string;
    name?: string;
    email?: string;
    admin?: boolean;
    ranks?: string[];
  };
}>();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const state = reactive({
  name: props.user.name ?? "",
  email: props.user.email ?? "",
  admin: !!props.user.admin,
  ranks: [...(props.user.ranks ?? [])],
});

watch(
  () => props.user,
  (next) => {
    state.name = next.name ?? "";
    state.email = next.email ?? "";
    state.admin = !!next.admin;
    state.ranks = [...(next.ranks ?? [])];
  },
  { deep: true },
);

const onSubmit = async () => {
  loading.value = true;

  try {
    await pb.collection("users").update(props.user.id, {
      name: state.name,
      email: state.email,
      admin: state.admin,
      ranks: state.ranks,
    });

    toast.add({ title: "Benutzer aktualisiert", icon: "i-lucide-save" });

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  state.name = props.user.name ?? "";
  state.email = props.user.email ?? "";
  state.admin = !!props.user.admin;
  state.ranks = [...(props.user.ranks ?? [])];
};
</script>
