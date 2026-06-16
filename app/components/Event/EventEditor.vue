<template>
  <FormDrawer
    v-model:open="open"
    :title="isEdit ? 'Event bearbeiten' : 'Neues Event'"
    :submit-label="isEdit ? 'Aktualisieren' : 'Speichern'"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
    <template #trigger>
      <span class="hidden" />
    </template>

    <UFormField class="w-full" label="Name" name="name">
      <UInput v-model="state.name" size="lg" class="w-full" />
    </UFormField>

    <UFormField class="w-full" label="Adresse" name="address">
      <UInputMenu
        :model-value="selectedAddress"
        :items="addressSuggestions"
        :loading="addressLoading"
        ignore-filter
        placeholder="Adresse suchen..."
        class="w-full"
        @update:search-term="onAddressSearch"
        @update:model-value="onAddressSelect"
      />
      <p v-if="state.geoLocation" class="text-xs text-muted mt-1">
        {{ state.geoLocation.lat.toFixed(5) }}, {{ state.geoLocation.lon.toFixed(5) }}
      </p>
    </UFormField>

    <div class="flex lg:flex-row flex-col gap-4">
      <UFormField class="w-full" label="Start" name="startDate">
        <UInput
          v-model="state.startDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
      <UFormField class="w-full" label="Ende" name="endDate">
        <UInput
          v-model="state.endDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="flex flex-row gap-4 items-center">
      <label for="event-editor-recurring">Wiederholung</label>
      <UCheckbox
        id="event-editor-recurring"
        v-model="isRecurring"
        name="recurring"
        size="lg"
      />
    </div>

    <div v-if="isRecurring">
      <UCheckboxGroup
        v-model="state.daysOfWeek"
        :items="DAY_NAMES"
        variant="table"
      />
    </div>

    <div v-if="isEdit" class="border-t border-default pt-4 mt-2">
      <DeleteConfirmModal
        title="Event löschen"
        :description="`Soll das Event ${props.event?.name ?? ''} wirklich gelöscht werden?`"
        confirm-label="Event löschen"
        @confirm="(close: () => void) => onDelete(close)"
      >
        <UButton
          type="button"
          color="error"
          variant="outline"
          icon="i-lucide-trash"
          block
        >
          Event löschen
        </UButton>
      </DeleteConfirmModal>
    </div>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  event?: {
    id: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    daysOfWeek?: number[];
    address?: string;
    geoLocation?: { lat: number; lon: number } | null;
  } | null;
  initialDate?: string | null;
}>();
const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const loading = ref(false);

const DAY_NAMES = WEEK_DAYS;

const isEdit = computed(() => !!props.event?.id);
const isRecurring = ref(false);

type GeoPoint = { lat: number; lon: number };

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  address: string;
  geoLocation: GeoPoint | null;
};

const buildState = (): FormState => {
  if (props.event) {
    const dayIndices = Array.isArray(props.event.daysOfWeek)
      ? props.event.daysOfWeek
      : [];
    return {
      name: props.event.name ?? "",
      startDate: toLocalDateTime(props.event.startDate),
      endDate: toLocalDateTime(props.event.endDate),
      daysOfWeek: dayIndices
        .map((i) => INDEX_TO_DAY[i])
        .filter((d): d is string => Boolean(d)),
      address: props.event.address ?? "",
      geoLocation: props.event.geoLocation ?? null,
    };
  }
  return {
    name: "",
    startDate: toLocalDateTime(props.initialDate),
    endDate: toLocalDateTime(props.initialDate),
    daysOfWeek: [],
    address: "",
    geoLocation: null,
  };
};

// Address autocomplete via Photon (OpenStreetMap, no API key required)
type AddressSuggestion = { label: string; lat: number; lon: number };

const addressSuggestions = ref<AddressSuggestion[]>([]);
const addressLoading = ref(false);
const selectedAddress = ref<AddressSuggestion | undefined>(undefined);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const onAddressSearch = (query: string) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!query || query.length < 3) {
    addressSuggestions.value = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    addressLoading.value = true;
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=de`
      );
      const data = await res.json();
      addressSuggestions.value = (data.features ?? []).map((f: any) => {
        const p = f.properties;
        const street = p.housenumber ? `${p.street ?? ""} ${p.housenumber}`.trim() : p.street;
        const city = p.postcode ? `${p.postcode} ${p.city ?? ""}`.trim() : p.city;
        const label = [street, city, p.country].filter(Boolean).join(", ");
        return {
          label: label || p.name || query,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        };
      });
    } catch {
      addressSuggestions.value = [];
    } finally {
      addressLoading.value = false;
    }
  }, 300);
};

const onAddressSelect = (item: AddressSuggestion | undefined) => {
  selectedAddress.value = item;
  if (item) {
    state.address = item.label;
    state.geoLocation = { lat: item.lat, lon: item.lon };
  }
};

const state = reactive<FormState>(buildState());

const seed = () => {
  Object.assign(state, buildState());
  isRecurring.value = state.daysOfWeek.length > 0;
  selectedAddress.value = state.address
    ? { label: state.address, lat: state.geoLocation?.lat ?? 0, lon: state.geoLocation?.lon ?? 0 }
    : undefined;
};

watch(open, (next) => {
  if (next) seed();
});

watch(
  () => [props.event, props.initialDate],
  () => {
    if (open.value) seed();
  },
);

const onSubmit = async () => {
  if (!state.name.trim()) {
    toast.add({
      color: "warning",
      title: "Name ist erforderlich",
      icon: "i-lucide-triangle-alert",
    });
    return;
  }

  loading.value = true;

  const daysOfWeekIndex = isRecurring.value
    ? state.daysOfWeek
        .map((d) => DAY_TO_INDEX[d])
        .filter((i): i is number => i !== undefined)
    : [];

  const payload = {
    name: state.name,
    startDate: toPbDateTime(state.startDate),
    endDate: toPbDateTime(state.endDate),
    daysOfWeek: daysOfWeekIndex,
    address: state.address || null,
    geoLocation: state.geoLocation || null,
  };

  try {
    if (isEdit.value && props.event) {
      await pb.collection("events").update(props.event.id, {
        ...payload,
        updatedBy: user.value?.id,
      });
      toast.add({ title: "Event aktualisiert", icon: "i-lucide-save" });
    } else {
      await pb.collection("events").create({
        ...payload,
        createdBy: user.value?.id,
      });
      toast.add({ title: "Event eingefügt", icon: "i-lucide-save" });
    }

    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onDelete = async (close: () => void) => {
  if (!props.event) return;
  loading.value = true;
  try {
    await pb.collection("events").delete(props.event.id);
    toast.add({ title: "Event gelöscht", icon: "i-lucide-trash" });
    close();
    emit("refresh");
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  seed();
};
</script>
