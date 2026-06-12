const bool = (v: boolean) => (v ? "✓" : "");

export const useParticipantsPDF = () => {
  const exportPDF = async (participants: ParticipantsResponse[], eventName?: string) => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const head = [
      [
        "Nachname",
        "Vorname",
        "Stufe",
        "Alter",
        "Leitung",
        "Bezahlt",
        "E-Mail",
        "Mobil / Telefon",
      ],
    ];

    const toRow = (p: ParticipantsResponse) => [
      p.lastname ?? "",
      p.firstname ?? "",
      p.rank ?? "",
      p.age ?? "",
      bool(p.isLeader),
      bool(p.paid),
      p.email ?? "",
      p.mobile || p.phone || "",
    ];

    const COLUMN_STYLES = {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 10 },
      4: { cellWidth: 14, halign: "center" as const },
      5: { cellWidth: 14, halign: "center" as const },
    };

    const GREEN: [number, number, number] = [22, 163, 74];
    const WHITE: [number, number, number] = [255, 255, 255];

    const renderTable = (
      title: string,
      rows: ParticipantsResponse[],
      startY: number,
      rankName?: string,
      rankIndex = 0,
    ) => {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, startY);

      const color = rankName
        ? getRankColor(rankName, rankIndex)
        : { rgb: GREEN, fontRgb: WHITE };

      autoTable(doc, {
        startY: startY + 4,
        head,
        body: rows.map(toRow),
        headStyles: { fillColor: color.rgb, textColor: color.fontRgb, fontSize: 7 },
        bodyStyles: { fontSize: 7 },
        columnStyles: COLUMN_STYLES,
        margin: { left: 14, right: 14 },
      });

      return (doc as any).lastAutoTable.finalY as number;
    };

    // ── Page 1: all participants ───────────────────────────────────────────────
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(eventName ? `Teilnehmer – ${eventName}` : "Teilnehmerliste", 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(
      `Erstellt am ${new Date().toLocaleDateString("de-DE")} · ${participants.length} Teilnehmer`,
      14,
      24,
    );
    doc.setTextColor(0);

    renderTable("Alle Teilnehmer", participants, 32);

    // ── One page per rank ──────────────────────────────────────────────────────
    const ranks = [
      ...new Set(participants.map((p) => p.rank || "Ohne Stufe")),
    ].sort();

    ranks.forEach((rank, i) => {
      const rankParticipants = participants.filter(
        (p) => (p.rank || "Ohne Stufe") === rank,
      );
      doc.addPage();
      renderTable(`${rank} (${rankParticipants.length})`, rankParticipants, 16, rank, i);
    });

    // ── Page numbers ───────────────────────────────────────────────────────────
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(`${p} / ${total}`, pageWidth - 14, pageHeight - 8, { align: "right" });
      doc.setTextColor(0);
    }

    const slug = eventName
      ? `-${eventName.toLowerCase().replace(/\s+/g, "-")}`
      : "";
    doc.save(`teilnehmer${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return { exportPDF };
};
