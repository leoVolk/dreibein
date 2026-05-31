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
        <CreateInvoice
          v-if="eventId"
          :event-id="eventId"
          @refresh="emit('refresh')"
        />
      </div>
    </template>

    <UEmpty
      v-if="!invoices.length"
      icon="i-lucide-files"
      size="sm"
      description="Noch keine Rechnungen angelegt."
    />

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-left text-muted border-b border-default">
          <th class="pb-2 font-medium">Name</th>
          <th class="pb-2 font-medium text-right">Betrag</th>
          <th class="pb-2 font-medium text-right">Datum</th>
          <th class="pb-2 font-medium text-right">Kategorie</th>
          <th class="pb-2" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="invoice in invoices"
          :key="invoice.id"
          class="border-b border-default last:border-0"
        >
          <td class="py-2">{{ invoice.name || "Ohne Titel" }}</td>
          <td class="py-2 text-right tabular-nums">
            {{ formatCurrency(invoice.value) }}
          </td>
          <td class="py-2 text-right text-muted">
            {{ formatDate(invoice.created) }}
          </td>
          <td class="py-2 text-right text-muted">
            {{ invoice.category }}
          </td>
          <td class="py-2 text-right">
            <div class="flex items-center justify-end gap-1">
              <InvoiceFilePreview v-if="invoice.file" :invoice="invoice" />
              <EditInvoice :invoice="invoice" @refresh="emit('refresh')" />
              <DeleteConfirmModal
                title="Rechnung löschen"
                :description="`Soll '${invoice.name || 'diese Rechnung'}' wirklich gelöscht werden?`"
                confirm-label="Löschen"
                @confirm="(close) => onDelete(invoice.id, close)"
              />
            </div>
          </td>
        </tr>
        <tr class="font-semibold border-t-2 border-default">
          <td class="pt-3">Gesamt</td>
          <td class="pt-3 text-right tabular-nums">
            {{ formatCurrency(total) }}
          </td>
          <td class="pt-3" />
          <td class="pt-3" />
        </tr>
      </tbody>
    </table>
  </UCard>
</template>

<script lang="ts" setup>
const props = defineProps<{
  invoices: InvoicesResponse[];
  eventId?: string;
  totalValue?: number;
}>();

const emit = defineEmits(["refresh"]);

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

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
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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
