<template>
  <UDrawer v-model:open="open" direction="right" :handle="false">
    <template #content>
      <div
        v-if="member && !pending"
        class="flex flex-col h-full overflow-y-auto w-2xl max-w-2xl"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-default sticky top-0 dark:bg-neutral-900/50 bg-neutral-50/50 backdrop-blur-sm shadow-md"
        >
          <div>
            <h2 class="text-xl font-semibold">
              {{ member.vorname }} {{ member.nachname }}
            </h2>
            <p class="text-sm text-muted">
              Nr. {{ member.mitgliedsNummer }} &middot; {{ member.stufe }}
            </p>
          </div>
          <UBadge
            :color="member.status === 'Aktiv' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ member.status }}
          </UBadge>
        </div>

        <div class="flex flex-col gap-6 p-4">
          <section class="flex flex-col gap-2">
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Persönliches
            </h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <template v-for="f in personalFields" :key="f.label">
                <div v-if="f.value" class="flex flex-col gap-0.5">
                  <dt class="text-xs text-muted">{{ f.label }}</dt>
                  <dd class="font-medium">{{ f.value }}</dd>
                </div>
              </template>
            </dl>
          </section>

          <USeparator />

          <section class="flex flex-col gap-2">
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Kontakt
            </h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <template v-for="f in contactFields" :key="f.label">
                <div
                  v-if="f.value"
                  class="flex flex-col gap-0.5"
                  :class="f.span ? 'col-span-2' : ''"
                >
                  <dt class="text-xs text-muted">{{ f.label }}</dt>
                  <dd class="font-medium">{{ f.value }}</dd>
                </div>
              </template>
            </dl>
          </section>

          <USeparator />

          <section class="flex flex-col gap-2">
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Adresse
            </h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <template v-for="f in addressFields" :key="f.label">
                <div
                  v-if="f.value"
                  class="flex flex-col gap-0.5"
                  :class="f.span ? 'col-span-2' : ''"
                >
                  <dt class="text-xs text-muted">{{ f.label }}</dt>
                  <dd class="font-medium">{{ f.value }}</dd>
                </div>
              </template>
            </dl>
          </section>

          <USeparator />

          <section class="flex flex-col gap-2">
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Mitgliedschaft
            </h3>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <template v-for="f in membershipFields" :key="f.label">
                <div
                  v-if="f.value"
                  class="flex flex-col gap-0.5"
                  :class="f.span ? 'col-span-2' : ''"
                >
                  <dt class="text-xs text-muted">{{ f.label }}</dt>
                  <dd class="font-medium">{{ f.value }}</dd>
                </div>
              </template>
            </dl>
          </section>
        </div>
      </div>

      <div
        v-else-if="pending"
        class="flex items-center justify-center h-full w-2xl max-w-2xl"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 text-muted animate-spin"
        />
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  namiId: number | null;
}>();

const { pb } = usePocketbase();

const {
  data: member,
  pending,
  execute,
} = useAsyncData(
  () => `nami-member-${props.namiId}`,
  () => pb.send(`/api/nami/members/${props.namiId}`, { method: "GET" }),
  {
    immediate: false,
    getCachedData(key, nuxtApp, context) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

watch(open, (val) => {
  if (val && props.namiId) execute();
});

const personalFields = computed(() => [
  { label: "Geburtsdatum", value: member.value?.geburtsDatum?.slice(0, 10) },
  { label: "Geschlecht", value: member.value?.geschlecht },
  { label: "Staatsangehörigkeit", value: member.value?.staatsangehoerigkeit },
  { label: "Konfession", value: member.value?.konfession },
  { label: "Spitzname", value: member.value?.spitzname },
]);

const contactFields = computed(() => [
  { label: "E-Mail", value: member.value?.email, span: true },
  {
    label: "E-Mail Erziehungsber.",
    value: member.value?.emailVertretungsberechtigter,
    span: true,
  },
  { label: "Telefon 1", value: member.value?.telefon1 },
  { label: "Telefon 2", value: member.value?.telefon2 },
  { label: "Telefon 3", value: member.value?.telefon3 },
]);

const addressFields = computed(() => [
  { label: "Straße", value: member.value?.strasse, span: true },
  { label: "PLZ", value: member.value?.plz },
  { label: "Ort", value: member.value?.ort },
  { label: "Region", value: member.value?.region, span: true },
  { label: "Land", value: member.value?.land },
]);

const membershipFields = computed(() => [
  { label: "Typ", value: member.value?.mglType },
  { label: "Beitragsart", value: member.value?.beitragsart },
  { label: "Stufe", value: member.value?.ersteUntergliederung },
  { label: "Gruppierung", value: member.value?.gruppierung, span: true },
  {
    label: "Eintrittsdatum",
    value: member.value?.eintrittsdatum?.slice(0, 10),
  },
  {
    label: "Austrittsdatum",
    value: member.value?.austrittsDatum?.slice(0, 10),
  },
  {
    label: "Zeitschriftenversand",
    value: member.value?.zeitschriftenversand ? "Ja" : "Nein",
  },
]);
</script>
