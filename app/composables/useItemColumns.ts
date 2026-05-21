import type { TableColumn } from "@nuxt/ui";

export function useItemColumns() {
  const itemColumns: TableColumn<any>[] = [
    {
      header: "Kategorie",
      accessorKey: "category",
      cell: ({ row }) => (row.original as any).expand?.category?.name || "-",
    },
    { header: "Name", accessorKey: "name" },
    {
      header: "Beschreibung",
      accessorKey: "description",
      cell: ({ row }) => row.getValue("description") || "-",
    },
    { header: "Anzahl", accessorKey: "quantity" },
    {
      header: "Ausgegeben am",
      accessorKey: "checkout",
      cell: ({ row }) => row.getValue("checkout") || "-",
    },
    {
      header: "Gewicht (kg)",
      accessorKey: "weight",
      cell: ({ row }) => `${row.getValue("weight")} kg`,
    },
    { header: "Status", accessorKey: "status" },
    { header: "", accessorKey: "actions" },
  ];

  const columns: TableColumn<any>[] = [
    { id: "expand", header: "" },
    ...itemColumns,
  ];

  const childColumns: TableColumn<any>[] = itemColumns;

  return { itemColumns, columns, childColumns };
}
