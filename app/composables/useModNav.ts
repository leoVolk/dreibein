import type { NavigationMenuItem } from "@nuxt/ui";

/**
 * Shared nav registry for mods. Call register() from a Nuxt plugin to inject
 * items into the main sidebar. Duplicate routes are silently ignored.
 */
export const useModNav = () => {
  const items = useState<NavigationMenuItem[]>("mod-nav-items", () => []);

  const register = (item: NavigationMenuItem) => {
    if (!items.value.some((i) => i.to === item.to)) {
      items.value.push(item);
    }
  };

  return { items, register };
};
