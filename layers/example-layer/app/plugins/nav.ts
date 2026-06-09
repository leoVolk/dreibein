export default defineNuxtPlugin(() => {
  const { register } = useModNav();

  register({
    label: "Beispiel-Erweiterung",
    icon: "i-lucide-puzzle",
    to: "/example-layer",
  });
});
