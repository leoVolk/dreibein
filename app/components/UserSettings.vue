<template>
  <div class="pt-4">
    <UCard variant="subtle">
      <template #header>
        <h3 class="text-xl flex items-center gap-2">
          <UIcon name="i-lucide-user" class="size-6" /> Benutzer Einstellungen
        </h3>
      </template>
      <template #default>
        <UForm class="flex flex-col gap-4" :state="userState">
          <UFormField label="Benutzername" class="w-1/2">
            <UInput
              variant="subtle"
              v-model="userState.username"
              size="lg"
              class="w-full"
            ></UInput>
          </UFormField>
          <div class="flex justify-end">
            <UButton
              icon="i-lucide-save"
              color="success"
              @click="onUserNameChange()"
              label="Speichern"
            ></UButton>
          </div>
        </UForm>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
const { user } = usePocketbaseAuth();
const { pb } = usePocketbase();

definePageMeta({
  middleware: ["auth"],
});

const toast = useToast();

const userState = reactive({
  username: user.value?.name,
});

const onUserNameChange = async () => {
  if (!user.value?.id) return;

  await pb
    .collection("users")
    .update(user.value?.id, { name: userState.username });

  toast.add({
    title: "Benutzername geändert",
    icon: "i-lucide-save",
  });
};

onMounted(async () => {
  userState.username = user.value?.name;
});
</script>

<style></style>
