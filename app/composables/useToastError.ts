export function useToastError() {
  const toast = useToast();
  return (error: any, fallback = "Etwas ist schiefgelaufen.") => {
    toast.add({
      color: "error",
      title: error?.message ?? fallback,
      icon: "i-lucide-triangle-alert",
    });
  };
}
