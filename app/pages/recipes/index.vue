<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <UBreadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Rezepte', to: '/recipes' },
        ]"
      />
    </div>

    <UPageHeader>
      <template #headline>
        <div class="flex flex-wrap justify-between w-full items-center gap-3">
          <h1 class="text-3xl sm:text-4xl font-bold text-highlighted min-w-0">Rezeptesammlung</h1>
          <RecipeFormDrawer
            title="Neues Rezept"
            :loading="saving"
            v-model:open="createOpen"
            v-model:state="createState"
            v-model:ingredient-rows="ingredientRows"
            @submit="onCreate"
            @close="resetCreate"
          >
            <template #trigger="{ open: openDrawer }">
              <UButton icon="i-lucide-plus" color="primary" label="Neues Rezept" @click="openDrawer" />
            </template>
          </RecipeFormDrawer>
        </div>
      </template>
    </UPageHeader>

    <UPageGrid v-if="recipes?.length">
      <UPageCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :title="recipe.name"
        :to="`/recipes/${recipe.id}`"
        class="hover:border-primary border border-default transition-all duration-150"
      >
        <template #description>
          <div class="flex flex-col gap-2 mt-1">
            <div
              v-if="recipe.servings"
              class="flex items-center gap-1 text-sm text-muted"
            >
              <UIcon name="i-lucide-users" class="size-3.5" />
              <span>{{ recipe.servings }} Portionen</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="cat in recipe.category"
                :key="cat"
                color="primary"
                variant="subtle"
                size="sm"
              >
                {{ cat }}
              </UBadge>
              <UBadge
                v-for="tag in recipe.tags"
                :key="tag"
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>

    <UEmpty
      v-else
      icon="i-lucide-chef-hat"
      title="Noch keine Rezepte"
      description="Füge das erste Rezept eurer Sammlung hinzu."
    >
      <template #actions>
        <RecipeFormDrawer
          title="Neues Rezept"
          :loading="saving"
          v-model:open="createOpen"
          v-model:state="createState"
          v-model:ingredient-rows="ingredientRows"
          trigger-label="Neues Rezept"
          trigger-icon="i-lucide-plus"
          @submit="onCreate"
          @close="resetCreate"
        />
      </template>
    </UEmpty>
  </div>
</template>

<script lang="ts" setup>
import type { IngredientRow } from "~/components/Recipe/RecipeFormDrawer.vue";

definePageMeta({ middleware: ["auth"] });

const { pb } = usePocketbase();
const toast = useToast();
const toastError = useToastError();
const router = useRouter();

const { data: recipes, refresh } = await useAsyncData("recipes", () =>
  pb.collection(Collections.Recipes).getFullList<RecipesResponse>({
    sort: "-created",
    requestKey: null,
  }),
);

useRealtimeRefresh("recipes", refresh);

const createOpen = ref(false);
const saving = ref(false);

const emptyState = () => ({
  name: "",
  servings: undefined as number | undefined,
  category: [] as string[],
  tags: [] as string[],
  preparation: "",
});

const createState = reactive(emptyState());
const ingredientRows = ref<IngredientRow[]>([]);

const resetCreate = () => {
  Object.assign(createState, emptyState());
  ingredientRows.value = [];
};

const onCreate = async () => {
  saving.value = true;
  try {
    const ingredientIds = await Promise.all(
      ingredientRows.value
        .filter((r) => r.name.trim())
        .map((r) =>
          pb
            .collection(Collections.Shoppinglistsitems)
            .create({ name: r.name, amount: r.amount, unit: r.unit }, { requestKey: null })
            .then((rec) => rec.id),
        ),
    );

    const record = await pb.collection(Collections.Recipes).create({
      ...createState,
      ingredients: ingredientIds,
    });

    toast.add({ title: "Rezept erstellt", icon: "i-lucide-chef-hat" });
    createOpen.value = false;
    resetCreate();
    router.push(`/recipes/${record.id}`);
  } catch (e: any) {
    toastError(e);
  } finally {
    saving.value = false;
  }
};
</script>
