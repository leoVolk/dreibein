export default defineNuxtRouteMiddleware(async (to, from) => {
  const { pb } = usePocketbase();

  if (!pb.authStore.isValid) {
    if (to.path !== "/login")
      return navigateTo("/login");
  }

  return;
});