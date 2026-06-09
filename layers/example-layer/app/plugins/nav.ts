export default defineNuxtPlugin(() => {
  const { register } = useLayerNav();

  register({
    label: "Beispiel-Erweiterung",
    icon: "i-lucide-puzzle",
    to: "/example-layer",
  });
});
