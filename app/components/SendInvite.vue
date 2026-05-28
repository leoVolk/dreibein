<template>
  <FormDrawer
    v-model:open="open"
    title="Einladung senden"
    trigger-label="Einladen"
    trigger-icon="i-lucide-mail-plus"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="state.email = ''"
  >
    <UFormField class="w-full" label="E-Mail" name="email">
      <UInput
        v-model="state.email"
        type="email"
        placeholder="email@beispiel.de"
        icon="i-lucide-at-sign"
        size="lg"
        class="w-full"
        autocomplete="off"
      />
    </UFormField>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const open = ref(false);
const loading = ref(false);
const state = reactive({ email: "" });

const onSubmit = async () => {
  loading.value = true;
  try {
    await pb.collection("invites").create({ email: state.email });
    toast.add({
      title: "Einladung versandt",
      description: state.email,
      icon: "i-lucide-mail-check",
    });
    state.email = "";
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};
</script>
