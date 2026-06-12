export const useMembersPDF = () => {
  const formatDate = (iso?: string) => (iso ? iso.slice(0, 10) : "");

  const exportPDF = async (members: any[]) => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const head = [
      [
        "MglNr",
        "Nachname",
        "Vorname",
        "Stufe",
        "Geschlecht",
        "Geburtsdatum",
        "Eintrittsdatum",
        "E-Mail",
        "E-Mail Erziehungsber.",
      ],
    ];

    const toRow = (m: any) => [
      m.entries_mitgliedsNummer ?? "",
      m.entries_nachname ?? "",
      m.entries_vorname ?? "",
      m.entries_stufe ?? "",
      m.entries_geschlecht ?? "",
      formatDate(m.entries_geburtsDatum),
      formatDate(m.entries_eintrittsdatum),
      m.entries_email ?? "",
      m.entries_emailVertretungsberechtigter ?? "",
    ];

    const COLUMN_STYLES = {
      0: { cellWidth: 20 },
      3: { cellWidth: 24 },
      4: { cellWidth: 20 },
      5: { cellWidth: 24 },
      6: { cellWidth: 24 },
    };

    const renderTable = (
      title: string,
      rows: any[],
      startY: number,
      stufeName?: string,
      stufeIndex = 0,
    ) => {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, startY);

      const color = stufeName
        ? getRankColor(stufeName, stufeIndex)
        : { rgb: [22, 163, 74] as [number, number, number], fontRgb: [255, 255, 255] as [number, number, number] };

      autoTable(doc, {
        startY: startY + 4,
        head,
        body: rows.map(toRow),
        headStyles: {
          fillColor: color.rgb,
          textColor: color.fontRgb,
          fontSize: 8,
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: COLUMN_STYLES,
        margin: { left: 14, right: 14 },
      });

      return (doc as any).lastAutoTable.finalY as number;
    };

    // ── Page 1: all members ────────────────────────────────────────────────────
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Mitgliederliste", 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(
      `Erstellt am ${new Date().toLocaleDateString("de-DE")} · ${members.length} Mitglieder`,
      14,
      24,
    );
    doc.setTextColor(0);

    renderTable("Alle Mitglieder", members, 32);

    // ── One page per Stufe ─────────────────────────────────────────────────────
    const stufen = [
      ...new Set(members.map((m: any) => m.entries_stufe ?? "Ohne Stufe")),
    ].sort();

    stufen.forEach((stufe, i) => {
      const stufenMembers = members.filter(
        (m: any) => (m.entries_stufe ?? "Ohne Stufe") === stufe,
      );
      doc.addPage();
      renderTable(`${stufe} (${stufenMembers.length})`, stufenMembers, 16, stufe, i);
    });

    // ── Page numbers ───────────────────────────────────────────────────────────
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(`${p} / ${total}`, pageWidth - 14, pageHeight - 8, {
        align: "right",
      });
      doc.setTextColor(0);
    }

    doc.save(
      `mitglieder-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  return { exportPDF };
};
