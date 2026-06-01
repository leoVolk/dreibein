<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center gap-2">
        <h3 class="text-lg flex items-center gap-2">
          <UIcon name="i-lucide-files" class="size-5 text-primary" />
          <span>Rechnungen</span>
          <UBadge color="neutral" variant="subtle" size="sm">
            {{ invoices.length }}
          </UBadge>
        </h3>
        <div class="flex items-center gap-2">
          <UTooltip text="Belege exportieren">
            <UButton
              icon="i-lucide-image"
              size="sm"
              variant="ghost"
              color="neutral"
              :loading="exportingReceipts"
              :disabled="!invoices.length"
              @click="onExportReceipts"
            />
          </UTooltip>
          <UTooltip text="Zusammenfassung exportieren">
            <UButton
              icon="i-lucide-download"
              size="sm"
              variant="ghost"
              color="neutral"
              :loading="exporting"
              :disabled="!invoices.length"
              @click="onExport"
            />
          </UTooltip>
          <CreateInvoice
            v-if="eventId"
            :event-id="eventId"
            @refresh="emit('refresh')"
          />
        </div>
      </div>
    </template>

    <UEmpty
      v-if="!invoices.length"
      icon="i-lucide-files"
      size="sm"
      description="Noch keine Rechnungen angelegt."
    />

    <template v-else>
      <UTable
        :data="invoices"
        :columns="columns"
        v-model:column-pinning="columnPinning"
        sticky
      >
        <template #name-cell="{ row }">
          {{ row.original.name || "Ohne Titel" }}
        </template>

        <template #value-cell="{ row }">
          <span class="tabular-nums">{{
            formatCurrency(row.original.value)
          }}</span>
        </template>

        <template #paidAt-cell="{ row }">
          <span class="text-muted">{{ formatDate(row.original.paidAt) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-1">
            <InvoiceFilePreview
              v-if="row.original.file"
              :invoice="row.original"
            />
            <EditInvoice :invoice="row.original" @refresh="emit('refresh')" />
            <DeleteConfirmModal
              title="Rechnung löschen"
              :description="`Soll '${row.original.name || 'diese Rechnung'}' wirklich gelöscht werden?`"
              confirm-label="Löschen"
              @confirm="(close) => onDelete(row.original.id, close)"
            />
          </div>
        </template>
      </UTable>

      <div
        class="flex justify-between items-center pt-3 mt-1 border-t-2 border-default px-4 font-semibold text-sm"
      >
        <span>Gesamt</span>
        <span class="tabular-nums">{{ formatCurrency(total) }}</span>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  invoices: InvoicesResponse[];
  eventId?: string;
  totalValue?: number;
  eventName?: string;
}>();

const emit = defineEmits(["refresh"]);

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
const { exportPDF, exportReceiptsPDF } = useInvoicePDF();
const exporting = ref(false);
const exportingReceipts = ref(false);
const columnPinning = ref({ right: ["actions"] });

const columns: TableColumn<InvoicesResponse>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Kategorie", accessorKey: "category" },
  { header: "Betrag", accessorKey: "value" },
  { header: "Datum", accessorKey: "paidAt" },
  { header: "", accessorKey: "actions" },
];

const total = computed(
  () =>
    props.totalValue ??
    props.invoices.reduce((sum, inv) => sum + (inv.value ?? 0), 0),
);

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    value ?? 0,
  );

const formatDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

const onExport = async () => {
  exporting.value = true;
  try {
    await exportPDF(props.invoices, props.eventName);
  } finally {
    exporting.value = false;
  }
};

const onExportReceipts = async () => {
  exportingReceipts.value = true;
  try {
    await exportReceiptsPDF(props.invoices, props.eventName);
  } finally {
    exportingReceipts.value = false;
  }
};

const onDelete = async (id: string, close: () => void) => {
  try {
    await pb.collection(Collections.Invoices).delete(id);
    toast.add({ title: "Rechnung gelöscht", icon: "i-lucide-trash" });
    close();
    emit("refresh");
  } catch (error: any) {
    toastError(error);
  }
};
</script>
