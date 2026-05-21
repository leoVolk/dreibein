<template>
  <FormDrawer
    v-model:open="open"
    title="Mitglied bearbeiten"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger="{ open: openDrawer }">
      <UTooltip text="Mitglied bearbeiten">
        <UButton
          variant="ghost"
          size="sm"
          color="primary"
          icon="i-lucide-pencil"
          @click="openDrawer"
        />
      </UTooltip>
    </template>

    <MemberFormFields :state="state" />
  </FormDrawer>
</template>

<script lang="ts" setup>
import { memberFormFrom } from "./memberForm";

const { pb } = usePocketbase();

const props = defineProps<{
  member: Record<string, any> & { id: string };
}>();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const state = reactive(memberFormFrom(props.member));

watch(
  () => props.member,
  (next) => Object.assign(state, memberFormFrom(next)),
  { deep: true },
);

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
    await pb.collection(Collections.Members).update(props.member.id, { ...state });

    toast.add({ title: "Mitglied aktualisiert", icon: "i-lucide-save" });

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, memberFormFrom(props.member));
};
</script>
