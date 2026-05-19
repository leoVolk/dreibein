type UnsubscribeFunc = () => void;

export function useRealtimeRefresh(
  collections: string | string[],
  refresh: () => unknown,
) {
  const { pb } = usePocketbase();
  const names = Array.isArray(collections) ? collections : [collections];
  const unsubscribers: UnsubscribeFunc[] = [];

  let scheduled = false;
  const trigger = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      refresh();
    });
  };

  onMounted(async () => {
    for (const name of names) {
      try {
        const unsub = (await pb
          .collection(name)
          .subscribe("*", trigger)) as UnsubscribeFunc;
        unsubscribers.push(unsub);
      } catch {
        // Collection may not exist yet or the user is not authenticated.
        // Stay silent — realtime is a nice-to-have, not load-bearing.
      }
    }
  });

  onBeforeUnmount(() => {
    unsubscribers.forEach((u) => {
      try {
        u();
      } catch {
        /* noop */
      }
    });
    unsubscribers.length = 0;
  });
}
