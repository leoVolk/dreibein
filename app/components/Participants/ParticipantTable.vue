<template>
  <UTable
    :data="participants"
    :columns="columns"
    v-model:column-pinning="columnPinning"
    sticky
  >
    <template #name-cell="{ row }">
      <span>{{ row.original.firstname }} {{ row.original.lastname }}</span>
    </template>

    <template #rank-cell="{ row }">
      <UBadge :class="`${getRankColor(row.original.rank).tailwind}`">
        {{ row.original.rank }}
      </UBadge>
    </template>

    <template #birthdate-cell="{ row }">
      <span v-if="row.original.birthdate" class="text-sm">
        {{ new Date(row.original.birthdate).toLocaleDateString("de-DE") }}
      </span>
    </template>

    <template #swimmer-cell="{ row }">
      <UCheckbox
        :model-value="row.original.swimmer"
        @update:model-value="onToggle(row.original, 'swimmer')"
      />
    </template>

    <template #maySwim-cell="{ row }">
      <UCheckbox
        :model-value="row.original.maySwim"
        @update:model-value="onToggle(row.original, 'maySwim')"
      />
    </template>

    <template #mayRoam-cell="{ row }">
      <UCheckbox
        :model-value="row.original.mayRoam"
        @update:model-value="onToggle(row.original, 'mayRoam')"
      />
    </template>

    <template #desinfection-cell="{ row }">
      <UCheckbox
        :model-value="row.original.desinfection"
        @update:model-value="onToggle(row.original, 'desinfection')"
      />
    </template>

    <template #fever-cell="{ row }">
      <UCheckbox
        :model-value="row.original.fever"
        @update:model-value="onToggle(row.original, 'fever')"
      />
    </template>

    <template #splinter-cell="{ row }">
      <UCheckbox
        :model-value="row.original.splinter"
        @update:model-value="onToggle(row.original, 'splinter')"
      />
    </template>

    <template #ticks-cell="{ row }">
      <UCheckbox
        :model-value="row.original.ticks"
        @update:model-value="onToggle(row.original, 'ticks')"
      />
    </template>

    <template #actions-cell="{ row }">
      <div class="flex items-center gap-1">
        <ParticipantEditDrawer
          :participant="row.original"
          @refresh="emit('refresh')"
        />
        <DeleteConfirmModal
          title="Teilnehmer entfernen"
          :description="`Soll ${row.original.firstname} ${row.original.lastname} wirklich entfernt werden?`"
          confirm-label="Entfernen"
          @confirm="(close) => onDelete(row.original.id, close)"
        />
      </div>
    </template>
  </UTable>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  participants: ParticipantsResponse[];
}>();

const emit = defineEmits<{ refresh: [] }>();

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const columnPinning = ref({ right: ["actions"] });

const columns: TableColumn<ParticipantsResponse>[] = [
  { id: "name", header: "Name" },
  { header: "Stufe", accessorKey: "rank" },
  { id: "birthdate", header: "Geburtsdatum" },
  { id: "swimmer", header: "Schwimmer" },
  { id: "maySwim", header: "Schwimmen" },
  { id: "mayRoam", header: "Gelände" },
  { id: "desinfection", header: "Desinfektion" },
  { id: "fever", header: "Fieber" },
  { id: "splinter", header: "Splitter" },
  { id: "ticks", header: "Zecke" },
  { header: "Ernährungswünsche", accessorKey: "dietaryPreferences" },
  { header: "Allergien", accessorKey: "allergies" },
  { header: "Krankheiten", accessorKey: "illnesses" },
  { header: "Medikamente", accessorKey: "medications" },
  { header: "", id: "actions" },
];

type BooleanField =
  | "swimmer"
  | "maySwim"
  | "mayRoam"
  | "desinfection"
  | "fever"
  | "splinter"
  | "ticks"
  | "media"
  | "DSGVO"
  | "privacyPolicy"
  | "permissions";

const onToggle = async (participant: ParticipantsResponse, field: BooleanField) => {
  try {
    await pb
      .collection(Collections.Participants)
      .update(participant.id, { [field]: !participant[field] });
    emit("refresh");
  } catch (error: any) {
    toastError(error);
  }
};

const onDelete = async (id: string, close: () => void) => {
  try {
    await pb.collection(Collections.Participants).delete(id);
    toast.add({ title: "Teilnehmer entfernt", icon: "i-lucide-user-minus" });
    close();
    emit("refresh");
  } catch (error: any) {
    toastError(error);
  }
};
</script>
