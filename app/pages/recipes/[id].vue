<template>
  <div class="flex flex-col gap-4">
    <UBreadcrumb
      :items="[
        { label: 'Home', to: '/' },
        { label: 'Rezepte', to: '/recipes' },
        { label: recipe?.name ?? '...' },
      ]"
    />

    <UPageHeader v-if="recipe" :title="recipe.name">
      <template #description>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="cat in recipe.category"
            :key="cat"
            color="primary"
            variant="subtle"
          >
            {{ cat }}
          </UBadge>
          <UBadge
            v-for="tag in recipe.tags"
            :key="tag"
            color="neutral"
            variant="subtle"
          >
            {{ tag }}
          </UBadge>
          <div
            v-if="recipe.servings"
            class="flex items-center gap-1 text-sm text-muted ml-1"
          >
            <UIcon name="i-lucide-users" class="size-3.5" />
            <span>{{ recipe.servings }} Portionen</span>
          </div>
        </div>
      </template>

      <template #actions>
        <RecipeFormDrawer
          title="Rezept bearbeiten"
          :loading="saving"
          v-model:open="editOpen"
          v-model:state="editState"
          v-model:ingredient-rows="ingredientRows"
          @submit="onUpdate"
          @close="resetEdit"
        >
          <template #trigger="{ open: openDrawer }">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="outline"
              @click="openDrawer"
            />
          </template>
        </RecipeFormDrawer>

        <DeleteConfirmModal
          title="Rezept löschen"
          description="Willst du dieses Rezept wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
          confirm-label="Rezept löschen"
          @confirm="onDelete"
        >
          <UButton icon="i-lucide-trash" color="error" variant="outline" />
        </DeleteConfirmModal>
      </template>
    </UPageHeader>

    <div v-if="recipe" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <UCard v-if="expandedIngredients.length" class="lg:col-span-1">
        <template #header>
          <span class="font-semibold">Zutaten</span>
          <span class="text-muted text-sm ml-2"
            >({{
              recipe.servings ? `für ${recipe.servings} Portionen` : ""
            }})</span
          >
        </template>
        <ul class="flex flex-col gap-2">
          <li
            v-for="ing in expandedIngredients"
            :key="ing.id"
            class="flex items-center gap-2 text-sm"
          >
            <UIcon
              name="i-lucide-circle-dot"
              class="size-3 text-primary shrink-0"
            />
            <span class="flex-1">{{ ing.name }}</span>
            <span v-if="ing.amount" class="text-muted"
              >{{ ing.amount }} {{ ing.unit ?? "" }}</span
            >
          </li>
        </ul>
      </UCard>

      <UCard
        :class="expandedIngredients.length ? 'lg:col-span-2' : 'lg:col-span-3'"
      >
        <template #header>
          <span class="font-semibold">Zubereitung</span>
        </template>
        <div
          v-if="recipe.preparation"
          class="prose dark:prose-invert max-w-none"
          v-html="recipe.preparation"
        />
        <p v-else class="text-muted text-sm">
          Noch keine Zubereitung hinterlegt.
        </p>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IngredientRow } from "~/components/Recipe/RecipeFormDrawer.vue";

definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const toastError = useToastError();

const recipeId = route.params.id as string;

type RecipeExpand = { ingredients: ShoppinglistsitemsResponse[] };

const { data: recipe, refresh } = await useAsyncData(`recipe-${recipeId}`, () =>
  pb
    .collection(Collections.Recipes)
    .getOne<RecipesResponse<RecipeExpand>>(recipeId, {
      expand: "ingredients",
    }),
);

const expandedIngredients = computed(
  () => recipe.value?.expand?.ingredients ?? [],
);

// --- Edit state ---
const editOpen = ref(false);
const saving = ref(false);

const buildEditState = () => ({
  name: recipe.value?.name ?? "",
  servings: recipe.value?.servings as number | undefined,
  category: [...(recipe.value?.category ?? [])] as string[],
  tags: [...(recipe.value?.tags ?? [])] as string[],
  preparation: recipe.value?.preparation ?? "",
});

const buildIngredientRows = (): IngredientRow[] =>
  (recipe.value?.expand?.ingredients ?? []).map((ing, i) => ({
    _key: i,
    id: ing.id,
    name: ing.name ?? "",
    amount: ing.amount,
    unit: ing.unit,
  }));

const editState = reactive(buildEditState());
const ingredientRows = ref<IngredientRow[]>(buildIngredientRows());

const resetEdit = () => {
  Object.assign(editState, buildEditState());
  ingredientRows.value = buildIngredientRows();
};

const onUpdate = async () => {
  saving.value = true;
  try {
    const originalIds = new Set(recipe.value?.ingredients ?? []);
    const currentIds = new Set(
      ingredientRows.value.filter((r) => r.id).map((r) => r.id!),
    );

    // Delete removed ingredients
    const deletedIds = [...originalIds].filter((id) => !currentIds.has(id));
    await Promise.all(
      deletedIds.map((id) =>
        pb.collection(Collections.Shoppinglistsitems).delete(id),
      ),
    );

    // Create new ingredients
    const newRows = ingredientRows.value.filter((r) => !r.id && r.name.trim());
    const newIds = await Promise.all(
      newRows.map((r) =>
        pb
          .collection(Collections.Shoppinglistsitems)
          .create(
            { name: r.name, amount: r.amount, unit: r.unit },
            { requestKey: null },
          )
          .then((rec) => rec.id),
      ),
    );

    const ingredientIds = [...currentIds, ...newIds];

    await pb.collection(Collections.Recipes).update(recipeId, {
      ...editState,
      ingredients: ingredientIds,
    });

    toast.add({ title: "Rezept gespeichert", icon: "i-lucide-save" });
    editOpen.value = false;
    await refresh();
    ingredientRows.value = buildIngredientRows();
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};

// --- Delete recipe ---
const onDelete = async (close: () => void) => {
  try {
    // Clean up orphaned ingredient records
    await Promise.all(
      (recipe.value?.ingredients ?? []).map((id) =>
        pb.collection(Collections.Shoppinglistsitems).delete(id),
      ),
    );
    await pb.collection(Collections.Recipes).delete(recipeId);
    toast.add({ title: "Rezept gelöscht", icon: "i-lucide-trash" });
    close();
    router.push("/recipes");
  } catch (e: any) {
    toastError(e);
  }
};
</script>
