<template>
  <UModal title="Zu Einkaufsliste hinzufügen">
    <slot>
      <UButton
        icon="i-lucide-shopping-cart"
        color="primary"
        label="Zu Einkaufsliste hinzufügen"
      />
    </slot>

    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Veranstaltung" name="event">
          <USelect
            v-model="selectedEventId"
            :items="eventOptions"
            placeholder="Veranstaltung wählen"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Einkaufsliste" name="list">
          <USelect
            v-model="selectedListId"
            :items="listOptions"
            placeholder="Einkaufsliste wählen"
            :disabled="!selectedEventId || listOptions.length === 0"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Portionen benötigt" name="servings">
          <UInput
            v-model.number="neededServings"
            type="number"
            min="1"
            class="w-full"
            size="lg"
            :placeholder="
              recipe.servings
                ? `Rezept: ${recipe.servings} Portionen`
                : 'Anzahl Portionen'
            "
          />
        </UFormField>

        <div v-if="scaledIngredients.length" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">
              Zutaten
              <span v-if="recipe.servings" class="text-muted font-normal">
                (Faktor {{ scalingFactor.toFixed(2) }}×)
              </span>
            </p>
          </div>
          <div class="rounded-lg border border-default divide-y divide-default">
            <div
              v-for="ing in scaledIngredients"
              :key="ing.id"
              class="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span>{{ ing.name }}</span>
              <span v-if="ing.amount" class="text-muted">
                {{ ing.scaledAmount }} {{ ing.unit ?? "" }}
              </span>
            </div>
          </div>
        </div>

        <UEmpty
          v-else-if="expandedIngredients.length === 0"
          icon="i-lucide-package-open"
          title="Keine Zutaten"
          description="Dieses Rezept hat noch keine Zutaten hinterlegt."
          size="sm"
        />
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex w-full justify-between gap-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Abbrechen"
          @click="close"
        />
        <UButton
          color="primary"
          icon="i-lucide-shopping-cart"
          label="Hinzufügen"
          :loading="saving"
          :disabled="!selectedListId || scaledIngredients.length === 0"
          @click="onConfirm(close)"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type {
  RecipesResponse,
  ShoppinglistsitemsResponse,
  EventsResponse,
  ShoppinglistsResponse,
} from "~/../../shared/types/pocketbase";

type RecipeExpand = { ingredients: ShoppinglistsitemsResponse[] };

const props = defineProps<{
  recipe: RecipesResponse<RecipeExpand>;
}>();

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();

const selectedEventId = ref<string>("");
const selectedListId = ref<string>("");
const neededServings = ref<number>(props.recipe.servings ?? 1);
const saving = ref(false);

const expandedIngredients = computed(
  () => props.recipe.expand?.ingredients ?? [],
);

// Fetch all events
const { data: events } = await useAsyncData("events-for-recipe", () =>
  pb.collection(Collections.Events).getFullList<EventsResponse>({
    sort: "name",
    requestKey: null,
  }),
);

const eventOptions = computed(() =>
  (events.value ?? []).map((e) => ({ label: e.name, value: e.id })),
);

// Fetch shopping lists when event is selected
const { data: shoppingLists, refresh: refreshLists } = await useAsyncData(
  "shoppinglists-for-recipe",
  () => {
    if (!selectedEventId.value) return Promise.resolve([]);
    return pb
      .collection(Collections.Shoppinglists)
      .getFullList<ShoppinglistsResponse>({
        filter: `event = "${selectedEventId.value}"`,
        sort: "name",
        requestKey: null,
      });
  },
);

watch(selectedEventId, () => {
  selectedListId.value = "";
  refreshLists();
});

const listOptions = computed(() =>
  (shoppingLists.value ?? []).map((l) => ({ label: l.name, value: l.id })),
);

// Scaling
const scalingFactor = computed(() => {
  if (!props.recipe.servings || !neededServings.value) return 1;
  return neededServings.value / props.recipe.servings;
});

const scaledIngredients = computed(() =>
  expandedIngredients.value.map((ing) => ({
    ...ing,
    scaledAmount: ing.amount
      ? Math.round(ing.amount * scalingFactor.value * 10) / 10
      : undefined,
  })),
);

const onConfirm = async (close: () => void) => {
  if (!selectedListId.value) return;
  saving.value = true;
  try {
    await Promise.all(
      scaledIngredients.value.map((ing) =>
        pb.collection(Collections.Shoppinglistsitems).create(
          {
            name: ing.name,
            amount: ing.scaledAmount,
            unit: ing.unit,
            category: ing.category,
            list: selectedListId.value,
          },
          { requestKey: null },
        ),
      ),
    );
    toast.add({
      title: "Zutaten hinzugefügt",
      description: `${scaledIngredients.value.length} Artikel zur Einkaufsliste hinzugefügt.`,
      icon: "i-lucide-shopping-cart",
    });
    close();
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};
</script>
