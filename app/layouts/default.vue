<template>
  <UDashboardGroup>
    <UDashboardSidebar :ui="{ footer: 'border-t border-default' }">
      <template #header="{ collapsed }">
        <h2 v-if="!collapsed" class="font-semibold text-2xl">3Bein</h2>
        <UIcon
          v-else
          name="i-simple-icons-nuxtdotjs"
          class="size-5 text-primary mx-auto"
        />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :label="collapsed ? undefined : 'Search...'"
          :square="collapsed"
          block
        >
        </UDashboardSearchButton>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex-col flex gap-2 w-full">
          <UButton
            :avatar="{
              alt: user?.name,
            }"
            :label="collapsed ? undefined : user?.name"
            color="neutral"
            variant="ghost"
            class="w-full"
            :block="collapsed"
          />
          <UButton
            label="Abmelden"
            color="error"
            class="justify-center"
            :block="collapsed"
            @click="onSignOut"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <UDashboardSearch />
  </UDashboardGroup>
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
  lists.value
    .filter((l: any) => l.type != "collection")
    .map((list: any) => ({
      label: list.name,
      icon: "i-lucide-clipboard-list",
      to: `/lists/${list.id}`,
    })),
);

const collectionsLinks = computed(() =>
  lists.value
    .filter((l: any) => l.type != "default")
    .map((list: any) => ({
      label: list.name,
      icon: "i-lucide-clipboard-list",
      to: `/collections/${list.id}`,
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
    {
      label: "Lager Listen",
      icon: "i-lucide-folder",
      to: "/collections",
      defaultOpen: true,
      children: collectionsLinks.value,
    },
    {
      label: "Alle Materialien",
      icon: "i-lucide-list",
      to: "/items",
      defaultOpen: true,
    },
  ],
  [
    {
      label: "Hilfe & Info",
      icon: "i-lucide-info",
      to: "/help",
    },
    {
      label: "Feedback",
      icon: "i-lucide-message-circle-heart",
      to: "/feedback",
    },
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
