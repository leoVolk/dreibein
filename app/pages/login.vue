<template>
  <div class="h-screen flex flex-col p-4 justify-center items-center">
    <UPageCard class="w-full max-w-md">
      <UIcon name="i-lucide-user" class="size-12 mx-auto mb-4" />
      <h1 class="text-2xl text-center font-bold mb-4">
        Bei
        <span class="underline"><span class="text-primary">III</span>Bein</span>
        anmelden
      </h1>
      <UForm :state="form" class="flex flex-col gap-4" @submit.prevent="signIn">
        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="E-Mail"
            icon="i-lucide-at-sign"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Passwort" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Passwort"
            icon="i-lucide-asterisk"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UButton
          :loading="loading"
          type="submit"
          class="justify-center"
          @click="signIn"
        >
          Anmelden
        </UButton>
      </UForm>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "auth",
});

const { login } = usePocketbaseAuth();
const toast = useToast();

const loading = ref(false);
const form = reactive({
  email: "",
  password: "",
});

const signIn = async () => {
  loading.value = true;
  try {
    await login({ email: form.email, password: form.password });
    await navigateTo("/");
  } catch (error: any) {
    toast.add({
      title: "Anmeldung fehlgeschlagen",
      description: error?.message ?? "Bitte überprüfe deine Eingaben.",
      icon: "i-lucide-triangle-alert",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
