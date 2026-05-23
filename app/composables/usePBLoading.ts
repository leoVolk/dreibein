const isLoading = ref(false);
const pendingRequests = ref(0);
let patched = false;

export const usePBLoading = () => {
  const { pb } = usePocketbase();

  if (!patched) {
    patched = true;
    const originalSend = pb.send.bind(pb);

    pb.send = async function (path: string, options: object) {
      pendingRequests.value++;
      isLoading.value = true;
      try {
        return await originalSend(path, options);
      } finally {
        pendingRequests.value = Math.max(0, pendingRequests.value - 1);
        if (pendingRequests.value === 0) isLoading.value = false;
      }
    };
  }

  return { isLoading };
};
