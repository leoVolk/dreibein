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
      <template #header>
        <UDashboardNavbar class="lg:hidden" />
      </template>
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
const eventlists = ref();

lists.value = await pb.collection("lists").getFullList();
eventlists.value = await pb.collection("eventlists").getFullList();

pb.collection("lists").subscribe("*", async (e) => {
  lists.value = await pb.collection("lists").getFullList({ requestKey: null });
});

pb.collection("eventlists").subscribe("*", async (e) => {
  lists.value = await pb
    .collection("eventlists")
    .getFullList({ requestKey: null });
});

const listLinks = computed(() =>
  lists.value.map((list: any) => ({
    label: list.name,
    icon: "i-lucide-clipboard-list",
    to: `/lists/${list.id}`,
  })),
);

const eventListsLinks = computed(() =>
  eventlists.value.map((list: any) => ({
    label: list.name,
    icon: "i-lucide-clipboard-list",
    to: `/events/lists/${list.id}`,
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
      label: "Läger & Aktionen",
      icon: "i-lucide-flame-kindling",
      to: "/events",
      children: [
        {
          label: "Kalender",
          icon: "i-lucide-calendar",
          to: "/events/calendar",
        },
        {
          label: "Lager Listen",
          icon: "i-lucide-folder",
          to: "/events/lists",
          defaultOpen: true,
          children: eventListsLinks.value,
        },
      ],
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
