import type { Row, TableMeta } from "@tanstack/vue-table";

export function useItemStatusMeta(): TableMeta<any> {
  return {
    class: {
      tr: (row: Row<any>) => {
        switch (row.original.status) {
          case "checkedOut":
            return "bg-info/35";
          case "repair":
            return "bg-warning/35";
          case "damaged":
            return "bg-error/35";
          case "mildDamage":
            return "bg-warning/35";
          default:
            return "";
        }
      },
    },
  };
}
