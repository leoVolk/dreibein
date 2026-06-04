<template>
  <UTable
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

    <template v-if="showAddress" #address-cell="{ row }">
      <div v-if="row.original.street" class="flex flex-col gap-0.5 text-xs text-muted">
        <span>{{ row.original.street }}</span>
        <span>{{ row.original.zip }} {{ row.original.city }}</span>
      </div>
    </template>

    <template #paid-cell="{ row }">
      <UBadge :color="row.original.paid ? 'success' : 'error'" variant="subtle">
        {{ row.original.paid ? "Eingegangen" : "Ausstehend" }}
      </UBadge>
    </template>

    <template #actions-cell="{ row }">
      <div class="flex items-center gap-1">
        <UTooltip
          :text="row.original.paid ? 'Als ausstehend markieren' : 'Als bezahlt markieren'"
          :delay-duration="100"
        >
          <UButton
            :icon="row.original.paid ? 'i-lucide-banknote-x' : 'i-lucide-banknote-arrow-up'"
            :color="row.original.paid ? 'error' : 'success'"
            variant="ghost"
            @click="onTogglePaid(row.original)"
          />
        </UTooltip>
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
  showAddress?: boolean;
}>();

const emit = defineEmits<{ refresh: [] }>();

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const columnPinning = ref({ right: ["actions"] });

const columns = computed<TableColumn<ParticipantsResponse>[]>(() => [
  { id: "name", header: "Name" },
  { id: "paid", header: "Bezahlt" },
  { header: "Stufe", accessorKey: "rank" },
  { header: "Alter", accessorKey: "age" },
  { id: "contact", header: "Kontakt" },
  ...(props.showAddress ? [{ id: "address", header: "Adresse" } as TableColumn<ParticipantsResponse>] : []),
  { header: "Notizen", accessorKey: "notes" },
  { header: "", id: "actions" },
]);

const onTogglePaid = async (participant: ParticipantsResponse) => {
  try {
    await pb
      .collection(Collections.Participants)
      .update(participant.id, { paid: !participant.paid });
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
