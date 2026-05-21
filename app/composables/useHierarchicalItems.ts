import { computed, type Ref, type ComputedRef } from "vue";

export function useHierarchicalItems(items: Ref<any[]> | ComputedRef<any[]>) {
  const allItemIds = computed(() => new Set(items.value.map((i: any) => i.id)));

  const topLevelItems = computed(() =>
    items.value.filter(
      (i: any) => !i.parent || !allItemIds.value.has(i.parent),
    ),
  );

  const childrenOf = (parentId: string): any[] =>
    items.value.filter((i: any) => i.parent === parentId);

  return { topLevelItems, childrenOf };
}
