from __future__ import annotations

import html
import re
from pathlib import Path
from typing import List

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent
INPUT_MD = ROOT / "PROJECT_DOCUMENTATION.md"
OUTPUT_PDF = ROOT / "PROJECT_DOCUMENTATION_Friendly_NoCode.pdf"


def escape(text: str) -> str:
    return html.escape(text, quote=False)


def looks_like_programming_code(block_lines: List[str]) -> bool:
    text = "\n".join(block_lines).strip()
    if not text:
        return False

    code_signals = [
        "const ",
        "let ",
        "var ",
        "function ",
        "async ",
        "await ",
        "return ",
        "import ",
        "export ",
        "require(",
        "module.exports",
        "=>",
        "prisma.",
        "router.",
        "app.use(",
        "useState(",
        "useEffect(",
        "<View",
        "<Text",
        "<TouchableOpacity",
        "model ",
        "enum ",
        "@id",
        "@default",
        "SELECT ",
        "INSERT INTO",
        "CREATE TABLE",
        "Headers:",
        "Content-Type:",
        "Body:",
        '"scripts":',
        '"dependencies":',
        "{",
        "}",
        ";",
    ]

    diagram_signals = [
        "┌",
        "┐",
        "└",
        "┘",
        "├",
        "┤",
        "│",
        "▼",
        "▲",
        "═",
        "─",
        "AUTHENTICATION FLOW",
        "REQUEST LIFECYCLE",
        "ARCHITECTURE",
        "DATABASE MODELS",
    ]

    code_score = sum(1 for signal in code_signals if signal in text)
    diagram_score = sum(1 for signal in diagram_signals if signal in text)

    # Preserve diagram-heavy explanatory blocks.
    if diagram_score >= 3 and diagram_score >= code_score:
        return False

    return code_score >= 3


def build_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="TitleFriendly",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=30,
            textColor=colors.HexColor("#0C8A43"),
            alignment=TA_CENTER,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubtitleFriendly",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#4B5563"),
            alignment=TA_CENTER,
            spaceAfter=20,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1Friendly",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=23,
            textColor=colors.HexColor("#0C8A43"),
            spaceBefore=14,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2Friendly",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#14532D"),
            spaceBefore=12,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H3Friendly",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1F2937"),
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyFriendly",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.4,
            leading=15,
            textColor=colors.HexColor("#111827"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletFriendly",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.2,
            leading=14,
            leftIndent=12,
            firstLineIndent=0,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CodeFriendly",
            parent=styles["Code"],
            fontName="Courier",
            fontSize=8.3,
            leading=10.2,
            leftIndent=8,
            rightIndent=8,
            spaceBefore=4,
            spaceAfter=8,
            backColor=colors.HexColor("#F3F4F6"),
            borderPadding=8,
            borderColor=colors.HexColor("#D1D5DB"),
            borderWidth=0.5,
            borderRadius=4,
        )
    )
    return styles


def is_table_separator(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    stripped = stripped.replace("|", "").replace(":", "").replace(" ", "")
    return stripped and set(stripped) == {"-"}


def parse_table(lines: List[str], styles, page_width: float):
    rows = []
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if is_table_separator(line):
            continue
        if line.startswith("|"):
            line = line[1:]
        if line.endswith("|"):
            line = line[:-1]
        cols = [Paragraph(escape(c.strip()) or " ", styles["BodyFriendly"]) for c in line.split("|")]
        rows.append(cols)

    if not rows:
        return []

    col_count = max(len(r) for r in rows)
    for row in rows:
        while len(row) < col_count:
            row.append(Paragraph(" ", styles["BodyFriendly"]))

    usable_width = page_width - 4 * cm
    col_width = usable_width / max(col_count, 1)
    table = Table(rows, colWidths=[col_width] * col_count, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCFCE7")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#14532D")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D1D5DB")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ]
        )
    )
    return [table, Spacer(1, 0.18 * cm)]


def parse_markdown(text: str, styles, page_width: float):
    story = []
    lines = text.splitlines()
    i = 0
    in_code = False
    code_buffer: List[str] = []
    paragraph_buffer: List[str] = []
    table_buffer: List[str] = []
    skip_current_code_block = False

    def flush_paragraph():
        nonlocal paragraph_buffer
        if not paragraph_buffer:
            return
        text = " ".join(part.strip() for part in paragraph_buffer if part.strip())
        paragraph_buffer = []
        if text:
            story.append(Paragraph(escape(text), styles["BodyFriendly"]))

    def flush_code():
        nonlocal code_buffer
        if not code_buffer:
            return
        story.append(Preformatted("\n".join(code_buffer).rstrip(), styles["CodeFriendly"]))
        code_buffer = []

    def flush_table():
        nonlocal table_buffer
        if not table_buffer:
            return
        story.extend(parse_table(table_buffer, styles, page_width))
        table_buffer = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            flush_table()
            if in_code:
                if not skip_current_code_block:
                    flush_code()
                else:
                    code_buffer = []
                in_code = False
                skip_current_code_block = False
            else:
                in_code = True
                skip_current_code_block = False
            i += 1
            continue

        if in_code:
            code_buffer.append(line)
            if len(code_buffer) >= 2 and not skip_current_code_block:
                skip_current_code_block = looks_like_programming_code(code_buffer)
            i += 1
            continue

        if stripped.startswith("|") and "|" in stripped[1:]:
            flush_paragraph()
            table_buffer.append(line)
            i += 1
            while i < len(lines):
                nxt = lines[i].strip()
                if nxt.startswith("|") and "|" in nxt[1:]:
                    table_buffer.append(lines[i])
                    i += 1
                else:
                    break
            flush_table()
            continue

        if not stripped:
            flush_paragraph()
            flush_table()
            story.append(Spacer(1, 0.12 * cm))
            i += 1
            continue

        if stripped in {"---", "***", "___"}:
            flush_paragraph()
            flush_table()
            story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#D1D5DB"), spaceBefore=6, spaceAfter=8))
            i += 1
            continue

        if stripped.startswith("# "):
            flush_paragraph()
            flush_table()
            story.append(Spacer(1, 0.15 * cm))
            story.append(Paragraph(escape(stripped[2:].strip()), styles["H1Friendly"]))
            i += 1
            continue

        if stripped.startswith("## "):
            flush_paragraph()
            flush_table()
            story.append(Paragraph(escape(stripped[3:].strip()), styles["H2Friendly"]))
            i += 1
            continue

        if stripped.startswith("### "):
            flush_paragraph()
            flush_table()
            story.append(Paragraph(escape(stripped[4:].strip()), styles["H3Friendly"]))
            i += 1
            continue

        if re.match(r"^[-*]\s+", stripped):
            flush_paragraph()
            flush_table()
            items = []
            while i < len(lines):
                cur = lines[i].strip()
                if re.match(r"^[-*]\s+", cur):
                    items.append(ListItem(Paragraph(escape(re.sub(r"^[-*]\s+", "", cur)), styles["BulletFriendly"])))
                    i += 1
                else:
                    break
            story.append(ListFlowable(items, bulletType="bullet", start="circle", leftIndent=10))
            story.append(Spacer(1, 0.08 * cm))
            continue

        if re.match(r"^\d+\.\s+", stripped):
            flush_paragraph()
            flush_table()
            items = []
            while i < len(lines):
                cur = lines[i].strip()
                if re.match(r"^\d+\.\s+", cur):
                    items.append(ListItem(Paragraph(escape(re.sub(r"^\d+\.\s+", "", cur)), styles["BulletFriendly"])))
                    i += 1
                else:
                    break
            story.append(ListFlowable(items, bulletType="1", leftIndent=10))
            story.append(Spacer(1, 0.08 * cm))
            continue

        paragraph_buffer.append(line)
        i += 1

    flush_paragraph()
    flush_table()
    flush_code()
    return story


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawRightString(doc.pagesize[0] - 1.8 * cm, 1.2 * cm, f"Page {doc.page}")
    canvas.drawString(1.8 * cm, 1.2 * cm, "Apna Shahkot Documentation")
    canvas.restoreState()


def main():
    styles = build_styles()
    markdown = INPUT_MD.read_text(encoding="utf-8")

    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.8 * cm,
        title="Apna Shahkot - Friendly Documentation",
        author="GitHub Copilot",
    )

    story = []
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph("Apna Shahkot", styles["TitleFriendly"]))
    story.append(Paragraph("Friendly readable PDF version of the full project documentation", styles["SubtitleFriendly"]))
    story.append(Paragraph("For interviews, revision, and beginner-friendly study", styles["SubtitleFriendly"]))
    story.append(Paragraph("Programming code blocks removed for cleaner reading; explanations and diagrams preserved", styles["SubtitleFriendly"]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="80%", thickness=1.2, color=colors.HexColor("#0C8A43"), hAlign="CENTER", spaceBefore=8, spaceAfter=16))
    story.append(KeepTogether([
        Paragraph("What this PDF includes", styles["H2Friendly"]),
        ListFlowable(
            [
                ListItem(Paragraph("project overview and architecture", styles["BulletFriendly"])),
                ListItem(Paragraph("folder structure and code explanation", styles["BulletFriendly"])),
                ListItem(Paragraph("database design and feature implementation", styles["BulletFriendly"])),
                ListItem(Paragraph("deployment, interview preparation, and learning resources", styles["BulletFriendly"])),
            ],
            bulletType="bullet",
            leftIndent=10,
        ),
    ]))
    story.append(PageBreak())
    story.extend(parse_markdown(markdown, styles, A4[0]))

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF created: {OUTPUT_PDF}")


if __name__ == "__main__":
    main()
