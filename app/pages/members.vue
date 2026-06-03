<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Mitglieder', to: '/members' },
      ]"
    />

    <UPageHeader title="Alle Mitglieder" />

    <UEmpty
      v-if="!isConfigured"
      icon="i-lucide-key-round"
      title="NaMi Integration nicht eingerichtet"
    >
      <template #description>
        <p>
          Die NaMi Integration wurde nicht oder nur teilweise eingerichtet.
          <br />
          Um die NaMi Integration zu nutzen, bitte hinterlege valide NaMi Daten
          in
          <NuxtLink to="settings" class="text-primary underline"
            >den Einstellung</NuxtLink
          >
        </p>
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const settingsId = ref<string | null>(null);
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

const { data: namiSettings } = await useAsyncData("nami-settings", () =>
  pb
    .collection(Collections.Settings)
    .getFirstListItem("")
    .catch(() => null),
);

if (namiSettings.value) {
  settingsId.value = namiSettings.value.id;
  credentials.namiUsername = (namiSettings.value as any).namiUsername ?? "";
  credentials.namiPassword = (namiSettings.value as any).namiPassword ?? "";
  credentials.namiGroupId = (namiSettings.value as any).namiGroupId ?? "";
}

const { data: logs, pending } = useAsyncData("nami-members", () =>
  pb.send("/api/nami/members", { method: "GET" }),
);
</script>
