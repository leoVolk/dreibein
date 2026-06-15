<template>
  <UModal v-model:open="open" title="Zu Lager/Aktion hinzufügen">
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3 p-3 rounded-lg bg-elevated">
          <UIcon name="i-lucide-user" class="size-5 text-muted shrink-0" />
          <div>
            <p class="font-medium">
              {{ member.entries_vorname }} {{ member.entries_nachname }}
            </p>
            <p class="text-sm text-muted">
              {{ member.entries_stufe }} &middot; Nr.
              {{ member.entries_mitgliedsNummer }}
            </p>
          </div>
        </div>

        <template v-if="detailPending">
          <div class="flex items-center gap-2 text-sm text-muted">
            <UIcon
              name="i-lucide-loader-circle"
              class="size-4 animate-spin shrink-0"
            />
            Mitgliedsdaten werden geladen...
          </div>
          <USkeleton class="h-9 w-full rounded-md" />
          <USkeleton class="h-20 w-full rounded-md" />
          <USkeleton class="h-6 w-40 rounded-md" />
        </template>

        <template v-else>
          <UFormField label="Lager / Aktion" required>
            <USelect
              v-model="selectedEventId"
              :items="eventOptions"
              placeholder="Bitte wählen..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Notizen">
            <UTextarea
              v-model="notes"
              placeholder="Optionale Notizen..."
              class="w-full"
            />
          </UFormField>

          <div class="flex gap-6">
            <USwitch v-model="isLeader" label="Als Leiter hinzufügen" />
            <USwitch v-model="paid" label="Beitrag bezahlt" />
          </div>

          <UCollapsible v-model:open="detailsOpen">
            <button
              type="button"
              class="flex items-center gap-1.5 text-sm text-muted hover:text-default transition-colors w-full"
            >
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 transition-transform"
                :class="{ 'rotate-90': detailsOpen }"
              />
              Weitere Details (optional)
            </button>

            <template #content>
              <div
                class="flex flex-col gap-4 pt-3 border-t border-default mt-3"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Notfallkontakte
                </p>

                <div class="grid grid-cols-2 gap-4">
                  <UFormField
                    label="Notfallkontakt 1"
                    name="emergency1"
                    class="w-full"
                  >
                    <UInput v-model="extra.emergency1" class="w-full" />
                  </UFormField>
                  <UFormField
                    label="Notfallkontakt 2"
                    name="emergency2"
                    class="w-full"
                  >
                    <UInput v-model="extra.emergency2" class="w-full" />
                  </UFormField>
                </div>

                <p
                  class="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Gesundheit
                </p>

                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Allergien" name="allergies" class="w-full">
                    <UTextarea
                      v-model="extra.allergies"
                      class="w-full"
                      :rows="2"
                    />
                  </UFormField>
                  <UFormField
                    label="Ernährungswünsche"
                    name="dietaryPreferences"
                    class="w-full"
                  >
                    <UTextarea
                      v-model="extra.dietaryPreferences"
                      class="w-full"
                      :rows="2"
                    />
                  </UFormField>
                  <UFormField
                    label="Krankheiten"
                    name="illnesses"
                    class="w-full"
                  >
                    <UTextarea
                      v-model="extra.illnesses"
                      class="w-full"
                      :rows="2"
                    />
                  </UFormField>
                  <UFormField
                    label="Medikamente"
                    name="medications"
                    class="w-full"
                  >
                    <UTextarea
                      v-model="extra.medications"
                      class="w-full"
                      :rows="2"
                    />
                  </UFormField>
                  <UFormField
                    label="Sonstiges"
                    name="other"
                    class="col-span-2 w-full"
                  >
                    <UTextarea v-model="extra.other" class="w-full" :rows="2" />
                  </UFormField>
                </div>

                <p
                  class="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Berechtigung
                </p>

                <div class="grid grid-cols-2 gap-3">
                  <UCheckbox
                    v-model="extra.disinfection"
                    label="Desinfektion"
                  />
                  <UCheckbox v-model="extra.fever" label="Fieberthermometer" />
                  <UCheckbox
                    v-model="extra.splinter"
                    label="Splitterpinzette"
                  />
                  <UCheckbox v-model="extra.tick" label="Zeckenpinzette" />
                </div>
              </div>
            </template>
          </UCollapsible>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full gap-2 justify-between">
        <UButton variant="ghost" label="Abbrechen" @click="open = false" />
        <UButton
          label="Hinzufügen"
          icon="i-lucide-list-plus"
          :loading="saving"
          :disabled="!selectedEventId || detailPending"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  member: any;
}>();

const emit = defineEmits<{ added: [] }>();

const { pb } = usePocketbase();
const toast = useToast();

const selectedEventId = ref<string | undefined>(undefined);
const notes = ref("");
const isLeader = ref(false);
const paid = ref(false);
const detailsOpen = ref(false);
const saving = ref(false);

const extra = reactive({
  emergency1: "",
  emergency2: "",
  allergies: "",
  dietaryPreferences: "",
  illnesses: "",
  medications: "",
  other: "",
  disinfection: false,
  fever: false,
  splinter: false,
  tick: false,
});

const {
  data: detail,
  pending: detailPending,
  execute: fetchDetail,
} = useAsyncData(
  () => `nami-member-modal-${props.member.entries_id}`,
  () =>
    pb.send(`/api/nami/members/${props.member.entries_id}`, { method: "GET" }),
  { immediate: false },
);

onMounted(() => fetchDetail());

watch(open, (val) => {
  if (val) {
    fetchDetail();
  }
});

const { data: events } = await useAsyncData("events-for-participant", () =>
  pb
    .collection(Collections.Events)
    .getFullList<EventsResponse>({ sort: "-startDate" }),
);

const eventOptions = computed(() =>
  (events.value ?? []).map((e) => ({ label: e.name, value: e.id })),
);

function calcAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const onSubmit = async () => {
  if (!selectedEventId.value) return;
  saving.value = true;
  try {
    const m = detail.value;
    await pb.collection(Collections.Participants).create({
      event: selectedEventId.value,
      firstname: m.vorname ?? "",
      lastname: m.nachname ?? "",
      email: m.email ?? "",
      emailGuardian: m.emailVertretungsberechtigter ?? "",
      phone: m.telefon1 ?? "",
      mobile: m.telefon2 ?? "",
      phoneGuardian: m.telefon3 ?? "",
      rank: m.ersteUntergliederung ?? "",
      street: m.strasse ?? "",
      city: m.ort ?? "",
      zip: m.plz ? parseInt(m.plz) : undefined,
      age: m.geburtsDatum ? calcAge(m.geburtsDatum) : undefined,
      isLeader: isLeader.value,
      paid: paid.value,
      notes: notes.value || "",
      ...extra,
    });
    toast.add({
      title: `${m.vorname} ${m.nachname} hinzugefügt`,
      icon: "i-lucide-list-plus",
    });
    open.value = false;
    selectedEventId.value = undefined;
    notes.value = "";
    isLeader.value = false;
    paid.value = false;
    detailsOpen.value = false;
    Object.assign(extra, {
      emergency1: "",
      emergency2: "",
      allergies: "",
      dietaryPreferences: "",
      illnesses: "",
      medications: "",
      other: "",
      disinfection: false,
      fever: false,
      splinter: false,
      tick: false,
    });
    emit("added");
  } catch (error: any) {
    toast.add({
      title: "Fehler",
      description: error?.message,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    saving.value = false;
  }
};
</script>
