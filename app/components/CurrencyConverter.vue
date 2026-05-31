<template>
  <div
    class="flex flex-col gap-3 p-3 border border-default rounded-lg bg-elevated/50"
  >
    <div class="flex flex-row justify-between items-center">
      <p class="text-xs text-muted font-medium flex items-center gap-1.5">
        <UIcon name="i-lucide-arrow-left-right" class="size-3.5" />
        Fremdwährung umrechnen
      </p>

      <UButton
        @click="open = !open"
        :icon="open ? 'i-lucide-minus' : 'i-lucide-plus'"
        size="xs"
      ></UButton>
    </div>

    <div v-if="open" class="flex flex-col gap-3">
      <div class="flex gap-2">
        <UInput
          v-model="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Betrag"
          class="flex-1"
          size="lg"
        />
        <USelectMenu
          v-model="selectedCurrency"
          :items="currencyItems"
          placeholder="Währung"
          class="w-36"
          size="lg"
          searchable
        />
      </div>

      <div
        v-if="result !== null"
        class="flex items-center justify-between gap-3"
      >
        <span class="text-sm">
          <span class="text-muted">{{ amount }} {{ currency }} =</span>
          <span class="font-semibold ml-1">{{ result.toFixed(2) }} €</span>
          <span v-if="result" class="text-xs text-muted ml-2"
            >({{ rateDate }})</span
          >
        </span>
        <UButton
          size="sm"
          icon="i-lucide-check"
          @click="emit('use', parseFloat(result.toFixed(2)))"
        >
          Übernehmen
        </UButton>
      </div>

      <div
        v-else-if="pending"
        class="flex items-center gap-2 text-sm text-muted"
      >
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Wird umgerechnet…
      </div>
    </div>

    <UAlert
      v-if="error"
      color="error"
      icon="i-lucide-triangle-alert"
      :title="error"
      size="sm"
    />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ use: [value: number] }>();

type CurrencyItem = { label: string; value: string };

const open = ref(false);
const amount = ref<number | undefined>();
const selectedCurrency = ref<CurrencyItem>({
  label: "Swiss Franc",
  value: "CHF",
});
const currency = computed(() => selectedCurrency.value?.value ?? "CHF");

const { data: currencies } = await useFetch(
  "https://api.frankfurter.dev/v2/currencies",
  {
    key: "frankfurter-currencies",
    transform: ({ EUR: _, ...rest }) => rest,
    default: () => ({}) as Record<string, {}>,
  },
);

type ConvertResponse = { rate: number; date: string };

const {
  data: conversionData,
  error: fetchError,
  execute,
  pending,
} = useFetch<ConvertResponse>(
  () =>
    `https://api.frankfurter.dev/v2/rate/${selectedCurrency.value.value}/EUR`,
  { immediate: false, watch: false },
);

const result = computed(
  () => (conversionData.value?.rate || 1) * (amount.value || 0),
);
const rateDate = computed(() => conversionData.value?.date ?? "");
const error = computed(() =>
  fetchError.value ? "Umrechnung fehlgeschlagen." : null,
);
console.log(currencies.value);

const currencyItems = computed(() =>
  Object.entries(currencies.value).map(([code, obj]) => ({
    label: obj.name,
    value: obj.iso_code,
  })),
);

const formattedResult = computed(() =>
  result.value != null
    ? new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(result.value)
    : "",
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch([amount, currency], () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (amount.value && currency.value && currency.value !== "EUR") execute();
  }, 500);
});
</script>
