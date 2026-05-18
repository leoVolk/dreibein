export default defineNuxtRouteMiddleware((to) => {
  const { pb } = usePocketbase();

  const isAuthed = pb.authStore.isValid;

  if (!isAuthed && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (isAuthed && to.path === "/login") {
    return navigateTo("/");
  }
});
