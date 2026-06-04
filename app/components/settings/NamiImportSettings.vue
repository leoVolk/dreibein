<template>
  <div class="flex flex-col gap-4">
    <UAlert
      color="info"
      icon="i-lucide-info"
      title="Benötigt einen NaMi-Account mit Zugriff auf Mitgliedsdaten der Gruppierung."
    />

    <UForm
      :state="credentials"
      class="flex flex-col gap-4"
      @submit="onSaveCredentials"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField
          label="Benutzername"
          name="namiUsername"
          class="col-span-2 md:col-span-1"
        >
          <UInput
            v-model="credentials.namiUsername"
            placeholder="NaMi Benutzername"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Passwort"
          name="namiPassword"
          class="col-span-2 md:col-span-1"
        >
          <UInput
            v-model="credentials.namiPassword"
            type="password"
            placeholder="NaMi Passwort"
            class="w-full"
          />
        </UFormField>
        <UFormField
          class="col-span-2"
          label="Gruppierungsnummer"
          name="namiGroupId"
          description="Meistens Stammesnummer ohne führende 0"
        >
          <UInput
            v-model="credentials.namiGroupId"
            placeholder="z. B. 131913"
            class="w-full"
          />
        </UFormField>
      </div>
      <div class="flex justify-end">
        <UButton
          type="submit"
          :loading="savingCredentials"
          icon="i-lucide-save"
          label="Zugangsdaten speichern"
        />
      </div>
    </UForm>
  </div>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const toast = useToast();

const savingCredentials = ref(false);
const importing = ref(false);
const settingsId = ref<string | null>(null);
const importResult = ref<{ imported: number; skipped: number } | null>(null);

const credentials = reactive({
  namiUsername: "",
  namiPassword: "",
  namiGroupId: "",
});

const isConfigured = computed(
  () =>
    !!(
      credentials.namiUsername &&
      credentials.namiPassword &&
      credentials.namiGroupId
    ),
);

const { data: existingSettings } = await useAsyncData("nami-settings", () =>
  pb
    .collection(Collections.Settings)
    .getFirstListItem('integration = "nami"')
    .catch(() => null),
);

if (existingSettings.value) {
  settingsId.value = existingSettings.value.id;
  credentials.namiUsername = (existingSettings.value as any).namiUsername ?? "";
  credentials.namiPassword = (existingSettings.value as any).namiPassword ?? "";
  credentials.namiGroupId = (existingSettings.value as any).namiGroupId ?? "";
}

const onSaveCredentials = async () => {
  savingCredentials.value = true;
  try {
    const payload = {
      integration: "nami",
      namiUsername: credentials.namiUsername,
      namiPassword: credentials.namiPassword,
      namiGroupId: credentials.namiGroupId,
    };
    if (settingsId.value) {
      await pb.collection("settings").update(settingsId.value, payload);
    } else {
      const rec = await pb.collection("settings").create(payload);
      settingsId.value = rec.id;
    }
    toast.add({ title: "Zugangsdaten gespeichert", icon: "i-lucide-save" });
  } catch (error: any) {
    toast.add({
      title: "Fehler beim Speichern",
      description: error?.message,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    savingCredentials.value = false;
  }
};
</script>
