<template>
  <FormDrawer
    v-model:open="open"
    title="Neues Event"
    trigger-label="Event hinzufügen"
    :loading="loading"
    :state="state"
    @submit="onSubmit"
    @close="onAbort"
  >
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
      <UFormField class="w-full" label="Start" name="start">
        <UInput
          v-model="state.startDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
      <UFormField class="w-full" label="Ende" name="end">
        <UInput
          v-model="state.endDate"
          type="datetime-local"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="flex flex-row gap-4 items-center">
      <label for="recurring"> Wiederholung</label>
      <UCheckbox
        id="recurring"
        v-model="isRecurring"
        name="recurring"
        size="lg"
      />
    </div>

    <div v-if="isRecurring">
      <UCheckboxGroup
        v-model="state.daysOfWeek"
        :items="daysOfWeek"
        variant="table"
      />
    </div>
  </FormDrawer>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const { user } = usePocketbaseAuth();

const emit = defineEmits(["refresh"]);

const toast = useToast();
const toastError = useToastError();
const open = ref(false);
const loading = ref(false);

const isRecurring = ref(false);
const daysOfWeek = WEEK_DAYS;

type GeoPoint = { lat: number; lon: number };
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

const initialState = () => ({
  name: "",
  startDate: "",
  endDate: "",
  daysOfWeek: [] as string[],
  address: "",
  geoLocation: null as GeoPoint | null,
});

const state = reactive(initialState());

const onSubmit = async () => {
  loading.value = true;

  const daysOfWeekIndex = state.daysOfWeek
    .map((d) => DAY_TO_INDEX[d])
    .filter((i): i is number => i !== undefined);

  try {
    await pb.collection("events").create({
      ...state,
      startDate: toPbDateTime(state.startDate),
      endDate: toPbDateTime(state.endDate),
      daysOfWeek: daysOfWeekIndex,
      address: state.address || null,
      geoLocation: state.geoLocation || null,
      createdBy: user.value?.id,
    });

    toast.add({ title: "Event eingefügt", icon: "i-lucide-save" });

    emit("refresh");

    Object.assign(state, initialState());
    isRecurring.value = false;
    selectedAddress.value = undefined;
    open.value = false;
  } catch (error: any) {
    toastError(error);
  } finally {
    loading.value = false;
  }
};

const onAbort = () => {
  Object.assign(state, initialState());
  isRecurring.value = false;
  selectedAddress.value = undefined;
};
</script>
