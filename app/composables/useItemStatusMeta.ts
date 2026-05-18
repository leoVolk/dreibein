import type { TableMeta, Row } from "@tanstack/vue-table";

export function useItemStatusMeta(): TableMeta<any> {
  return {
    class: {
      tr: (row: Row<any>) => {
        switch (row.original.status) {
          case "checkedOut":
            return "bg-info/10";
          case "repair":
            return "bg-warning/10";
          case "damaged":
            return "bg-error/10";
          default:
            return "";
        }
      },
    },
  };
}
