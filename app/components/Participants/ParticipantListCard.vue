<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-lg flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-5 text-primary" />
          Teilnehmer
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ participants.length }}
          </UBadge>
        </h3>
      </div>
    </template>

    <UTable
      v-if="participants.length"
      :data="participants"
      :columns="columns"
      v-model:column-pinning="columnPinning"
      sticky
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-2">
          <span>{{ row.original.firstname }} {{ row.original.lastname }}</span>
          <UBadge v-if="row.original.isLeader" color="primary" variant="subtle" size="xs">
            Leitung
          </UBadge>
        </div>
      </template>

      <template #contact-cell="{ row }">
        <div class="flex flex-col gap-0.5 text-xs text-muted">
          <span v-if="row.original.email">{{ row.original.email }}</span>
          <span v-if="row.original.mobile || row.original.phone">
            {{ row.original.mobile || row.original.phone }}
          </span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <DeleteConfirmModal
          title="Teilnehmer entfernen"
          :description="`Soll ${row.original.firstname} ${row.original.lastname} wirklich entfernt werden?`"
          confirm-label="Entfernen"
          @confirm="(close) => onDelete(row.original.id, close)"
        />
      </template>
    </UTable>

    <UEmpty
      v-else
      icon="i-lucide-users"
      size="sm"
      description="Noch keine Teilnehmer hinzugefügt."
    />
  </UCard>
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
  { header: "Alter", accessorKey: "age" },
  { id: "contact", header: "Kontakt" },
  { header: "Notizen", accessorKey: "notes" },
  { header: "", id: "actions" },
];

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
