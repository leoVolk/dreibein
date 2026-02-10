<template>
  <div class="min-h-screenflex flex-col">
    <UHeader title="3Bein">
      <template #right>
        <UAvatar :alt="user?.name" size="md" />
        <UColorModeButton />
        <UButton
          variant="ghost"
          icon="i-lucide-share"
          class="transform rotate-90"
          @click="onSignOut()"
        ></UButton>
      </template>
    </UHeader>
    <div class="flex w-full max-w-(--ui-container) mx-auto flex-row">
      <div class="py-4">
        <UNavigationMenu orientation="vertical" :items="items">
          <template #lists-content="{ item }"> </template>
        </UNavigationMenu>
      </div>

      <div class="p-4 w-full">
        <slot />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const { user, signOut } = usePocketbaseAuth();
const { pb } = usePocketbase();

const router = useRouter();

const lists = ref();

lists.value = await pb.collection("lists").getFullList();

pb.collection("lists").subscribe("*", async (e) => {
  lists.value = await pb
    .collection("lists")
    .getFullList({ requestKey: "layout" });
});

const listLinks = computed(() =>
  lists.value.map((list: any) => ({
    label: list.name,
    icon: "i-lucide-clipboard-list",
    to: `/lists/${list.id}`,
  })),
);

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: "Home",
      icon: "i-lucide-home",
      to: "/",
    },
    {
      label: "Material Listen",
      icon: "i-lucide-folder",
      to: "/lists",
      defaultOpen: true,
      children: listLinks.value,
    },
  ],
  [
    {
      label: "Einstellungen",
      icon: "i-lucide-settings",
      to: "/settings",
    },
  ],
]);

const onSignOut = () => {
  signOut();

  router.push("/login");
};
</script>
