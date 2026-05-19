<template>
  <FormDrawer
    v-model:open="open"
    title="Neues Mitglied"
    trigger-label="Mitglied anlegen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <MemberFormFields :state="state" />
  </FormDrawer>
</template>

<script lang="ts" setup>
import { emptyMemberForm } from "./memberForm";

const { pb } = usePocketbase();

const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const state = reactive(emptyMemberForm());

const onSubmit = async () => {
  if (!state.firstName.trim() || !state.lastName.trim()) {
    toast.add({
      color: "warning",
      title: "Vor- und Nachname sind erforderlich",
      icon: "i-lucide-triangle-alert",
    });
    return;
  }

  loading.value = true;

  try {
    await pb.collection("members").create({ ...state });

    toast.add({ title: "Mitglied angelegt", icon: "i-lucide-save" });

    emit("refresh");
    Object.assign(state, emptyMemberForm());
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, emptyMemberForm());
};
</script>
