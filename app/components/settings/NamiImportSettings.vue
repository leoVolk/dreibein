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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UFormField label="Benutzername" name="namiUsername">
          <UInput
            v-model="credentials.namiUsername"
            placeholder="NaMi Benutzername"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Passwort" name="namiPassword">
          <UInput
            v-model="credentials.namiPassword"
            type="password"
            placeholder="NaMi Passwort"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Gruppierungsnummer" name="namiGroupId">
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

    <USeparator />

    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-muted">
        Löscht alle vorhandenen Mitglieder und importiert die aktuelle
        NaMi-Mitgliederliste.
      </p>
      <UButton
        :loading="importing"
        :disabled="!isConfigured"
        icon="i-lucide-cloud-download"
        label="Jetzt synchronisieren"
        color="primary"
        @click="onImport"
      />
    </div>

    <UAlert
      v-if="importResult"
      color="success"
      icon="i-lucide-check"
      :title="`${importResult.imported} Mitglieder importiert${importResult.skipped ? `, ${importResult.skipped} übersprungen` : ''}.`"
    />
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
    .getFirstListItem('name = "nami"')
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
      name: "nami",
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

const onImport = async () => {
  importing.value = true;
  importResult.value = null;
  try {
    const result = await pb.send("/api/nami/import", { method: "POST" });
    importResult.value = result;
    toast.add({
      title: `${result.imported} Mitglieder synchronisiert`,
      icon: "i-lucide-cloud-download",
    });
  } catch (error: any) {
    const msg =
      error?.response?.message || error?.message || "Unbekannter Fehler";
    toast.add({
      title: "Import fehlgeschlagen",
      description: msg,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    importing.value = false;
  }
};
</script>
