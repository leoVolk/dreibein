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

          <USwitch v-model="isLeader" label="Als Leiter hinzufügen" />
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
const saving = ref(false);

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
      notes: notes.value || "",
    });
    toast.add({
      title: `${m.vorname} ${m.nachname} hinzugefügt`,
      icon: "i-lucide-list-plus",
    });
    open.value = false;
    selectedEventId.value = undefined;
    notes.value = "";
    isLeader.value = false;
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
