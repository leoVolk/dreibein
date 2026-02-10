<template>
  <div class="h-screen flex flex-col justify-center items-center">
    <UPageCard class="w-full max-w-md">
      <UIcon name="i-lucide-user" class="size-12 mx-auto mb-4"></UIcon>
      <h1 class="text-2xl text-center font-bold mb-4">
        Bei <span class="underline">Dreibein</span> anmelden
      </h1>
      <div class="flex flex-col gap-4">
        <UFormField label="Email" required>
          <UInput
            type="email"
            v-model="email"
            placeholder="Enter your email"
            icon="i-lucide-at-sign"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Passwort" required>
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            icon="i-lucide-asterisk"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UButton @click="signIn()" class="justify-center">Anmelden</UButton>
      </div>
    </UPageCard>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "auth",
});

const { login } = usePocketbaseAuth();

const email = ref("");
const password = ref("");

const signIn = async () => {
  try {
    await login({
      email: email.value,
      password: password.value,
    });
    return navigateTo("/");
  } catch (error) {
    alert("Error logging in Check console for more details");
  }
};
</script>
