"""
Generate sample Indian land record PDFs for testing the ILRDVS upload pipeline.
Creates 3 documents:
  1. Form 7/12 Extract (Marathi / Maharashtra) — VALIDATED type
  2. ROR Patta Record (Tamil) — NEEDS_REVIEW type
  3. Khatian / Jamabandi (Hindi / Rajasthan) — Mixed confidence
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "sample_pdfs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

W, H = A4  # 595.27, 841.89

# ─────────────────────────────────────────────────────────
# Colour palette
DARK_RED   = colors.HexColor("#8B0000")
NAVY       = colors.HexColor("#1a237e")
DEEP_GREEN = colors.HexColor("#1B5E20")
SAFFRON    = colors.HexColor("#FF6F00")
LIGHT_GRAY = colors.HexColor("#F5F5F5")
MID_GRAY   = colors.HexColor("#BDBDBD")
DARK_GRAY  = colors.HexColor("#424242")
WHITE      = colors.white
BLACK      = colors.black


# ─────────────────────────────────────────────────────────
# Helper: draw a government seal watermark
def draw_watermark(c: canvas.Canvas, text: str):
    c.saveState()
    c.setFillColor(colors.HexColor("#E8EAF6"))
    c.setFont("Helvetica-Bold", 52)
    c.translate(W / 2, H / 2)
    c.rotate(35)
    c.drawCentredString(0, 0, text)
    c.restoreState()


# ─────────────────────────────────────────────────────────
# Helper: draw govt header band
def draw_header_band(c: canvas.Canvas, line1: str, line2: str, line3: str, color=NAVY):
    c.setFillColor(color)
    c.rect(0, H - 72, W, 72, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(W / 2, H - 22, line1)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(W / 2, H - 38, line2)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, H - 54, line3)


# Helper: draw official footer
def draw_footer(c: canvas.Canvas, doc_id: str, dept: str):
    c.setFillColor(DARK_GRAY)
    c.setFont("Helvetica", 7)
    c.drawString(20, 20, f"Document ID: {doc_id}   |   {dept}")
    c.drawRightString(W - 20, 20, "This is a system-generated record. Verify at bhuiyan.mp.gov.in")
    c.line(20, 30, W - 20, 30)


def draw_stamp_box(c: canvas.Canvas, x, y, label="VERIFIED\nSUB-REGISTRAR"):
    c.saveState()
    c.setStrokeColor(DEEP_GREEN)
    c.setFillColor(colors.HexColor("#E8F5E9"))
    c.roundRect(x, y, 110, 55, 4, fill=1, stroke=1)
    c.setFillColor(DEEP_GREEN)
    c.setFont("Helvetica-Bold", 8)
    for i, line in enumerate(label.split("\n")):
        c.drawCentredString(x + 55, y + 35 - i * 13, line)
    c.restoreState()


# ─────────────────────────────────────────────────────────
# PDF 1: Maharashtra Form 7/12 Extract
# ─────────────────────────────────────────────────────────
def generate_7_12_nashik():
    path = os.path.join(OUTPUT_DIR, "7_12_Extract_Nashik_Survey142_2A.pdf")
    c = canvas.Canvas(path, pagesize=A4)

    draw_watermark(c, "GOVT OF MAHARASHTRA")
    draw_header_band(
        c,
        "महाराष्ट्र शासन — महसूल विभाग  |  Government of Maharashtra — Revenue Department",
        "FORM 7/12 — LAND REVENUE RECORD (SATBARA UTARA)",
        "Issued under Maharashtra Land Revenue Code, 1966 · Talathi Certified Copy",
        color=NAVY
    )

    # Sub-header box
    c.setFillColor(colors.HexColor("#E3F2FD"))
    c.rect(15, H - 115, W - 30, 38, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, H - 88, "District: NASHIK")
    c.drawString(175, H - 88, "Taluka: IGATPURI")
    c.drawString(330, H - 88, "Village: KHAMBALE")
    c.drawString(25, H - 103, "Survey No.: 142/2A")
    c.drawString(175, H - 103, "Gut No.: 142")
    c.drawString(330, H - 103, "Hissa No.: 2A")

    # Registration metadata
    c.setFillColor(colors.HexColor("#FFF8E1"))
    c.rect(15, H - 155, W - 30, 35, fill=1, stroke=0)
    c.setFillColor(DARK_GRAY)
    c.setFont("Helvetica", 8)
    c.drawString(25, H - 132, "Registration Date: 12-Mar-2024")
    c.drawString(200, H - 132, "Mutation No.: M-7842/2024")
    c.drawString(390, H - 132, "Year: 2023–24")
    c.drawString(25, H - 148, "Circle Officer: Shri. R. K. Patil, Circle Inspector, Igatpuri")

    y = H - 175

    # Section A: Owner Details
    c.setFillColor(NAVY)
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "SECTION A — OWNERSHIP / TITLE HOLDER DETAILS (मालकाचे नाव)")
    y -= 20

    owner_data = [
        ["Sr.", "Khata No.", "Owner Name", "Father / Husband", "Address", "Share (%)"],
        ["1", "Khata-908", "Ramesh Anandrao Kulkarni\n(रमेश आनंदराव कुलकर्णी)", "Anandrao Kulkarni", "At-Khambale, Tal-Igatpuri,\nDist-Nashik – 422403", "100%"],
    ]
    t = Table(owner_data, colWidths=[22, 52, 130, 110, 145, 46])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t.wrapOn(c, W - 30, 200)
    t.drawOn(c, 15, y - 50)
    y -= 68

    # Section B: Land Details
    c.setFillColor(DEEP_GREEN)
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "SECTION B — LAND CLASSIFICATION & AREA (जमिनीचे वर्गीकरण)")
    y -= 20

    land_data = [
        ["Survey No.", "Land Class", "Irrigation Type", "Area (Hectares)", "Area (Acres)", "Assessment (₹)"],
        ["142/2A", "Bagayat\n(Orchard/Garden)", "Well Irrigated", "1.84 Ha", "4.54 Acres", "₹ 2,840"],
        ["142/2A (Part)", "Jirayat\n(Dry Land)", "Rain-fed", "0.26 Ha", "0.64 Acres", "₹ 380"],
        ["", "TOTAL", "", "2.10 Ha", "5.19 Acres", "₹ 3,220"],
    ]
    t2 = Table(land_data, colWidths=[60, 90, 90, 85, 80, 90])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DEEP_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, LIGHT_GRAY]),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E8F5E9")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t2.wrapOn(c, W - 30, 200)
    t2.drawOn(c, 15, y - 60)
    y -= 78

    # Section C: Encumbrances
    c.setFillColor(SAFFRON)
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "SECTION C — ENCUMBRANCES / LIENS (बोजे)")
    y -= 20
    enc_data = [
        ["Type", "Creditor / Authority", "Amount (₹)", "Registered On", "Status"],
        ["Agricultural Loan", "Nashik District Co-op. Bank Ltd.", "₹ 1,50,000", "15-Jan-2022", "Active"],
        ["Mortgage (Simple)", "Bank of Maharashtra, Igatpuri Br.", "₹ 3,80,000", "02-Aug-2023", "Active"],
    ]
    t3 = Table(enc_data, colWidths=[90, 155, 80, 90, 80])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SAFFRON),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t3.wrapOn(c, W - 30, 200)
    t3.drawOn(c, 15, y - 48)
    y -= 65

    # Certification block
    c.setFillColor(colors.HexColor("#F3E5F5"))
    c.rect(15, y - 60, W - 30, 58, fill=1, stroke=1)
    c.setFillColor(DARK_GRAY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(25, y - 12, "CERTIFICATION")
    c.setFont("Helvetica", 7.5)
    c.drawString(25, y - 26, "This is a certified copy of the Revenue Record (Satbara Utara) maintained under the Maharashtra Land Revenue Code, 1966.")
    c.drawString(25, y - 39, "Certified by: Talathi, Igatpuri Circle, Nashik District, Maharashtra")
    c.drawString(25, y - 52, "Date of Issue: 03-Sep-2024   |   Valid for: 90 days from date of issue")

    draw_stamp_box(c, W - 145, y - 62, "CERTIFIED TRUE COPY\nTALATHI IGATPURI\nNASHIK DIST.")
    draw_footer(c, "mh-2024-01089", "Maharashtra Revenue Department — e-Satbara System")

    c.save()
    print(f"✅ Generated: {path}")
    return path


# ─────────────────────────────────────────────────────────
# PDF 2: Tamil Nadu ROR Patta (Form 7/12 equivalent)
# ─────────────────────────────────────────────────────────
def generate_patta_nilgiris():
    path = os.path.join(OUTPUT_DIR, "Patta_ROR_Nilgiris_Survey123_4A.pdf")
    c = canvas.Canvas(path, pagesize=A4)

    draw_watermark(c, "GOVT OF TAMIL NADU")
    draw_header_band(
        c,
        "தமிழ்நாடு அரசு — வருவாய் மற்றும் பேரிடர் நிவாரண ஆணையகம்",
        "GOVERNMENT OF TAMIL NADU · REVENUE DEPARTMENT · FORM 7/12 ROR",
        "Rights of Record (ROR) / Patta Passbook — Certified Extract",
        color=DARK_RED
    )

    c.setFillColor(colors.HexColor("#FFF3E0"))
    c.rect(15, H - 115, W - 30, 38, fill=1, stroke=0)
    c.setFillColor(DARK_RED)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, H - 88, "State / மாநிலம்: Tamil Nadu")
    c.drawString(220, H - 88, "District / மாவட்டம்: Nilgiris (நீலகிரி)")
    c.drawString(25, H - 103, "Taluk / வட்டம்: Udhagamandalam (ஊட்டி)")
    c.drawString(220, H - 103, "Village / கிராமம்: Kotagiri (கொடைக்கானல்)")

    c.setFillColor(colors.HexColor("#FCE4EC"))
    c.rect(15, H - 155, W - 30, 35, fill=1, stroke=0)
    c.setFillColor(DARK_GRAY)
    c.setFont("Helvetica", 8)
    c.drawString(25, H - 132, "Patta No.: PTK-2024-4521")
    c.drawString(200, H - 132, "Survey No.: 123/4A")
    c.drawString(370, H - 132, "Sub-Div.: Hissa 4A")
    c.drawString(25, H - 148, "Document Type: ROR — PATTA PASSBOOK EXTRACT   |   Language: Tamil (தமிழ்)")

    y = H - 175

    # Owner
    c.setFillColor(DARK_RED)
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "PATTADAR (LANDOWNER) DETAILS — பட்டாதாரர் விவரங்கள்")
    y -= 20

    owner_data = [
        ["Patta No.", "Owner Name (Tamil)", "S/O · D/O · W/O", "Community", "Share"],
        ["PTK-4521", "Ramesh Kumar\n(ரமேஷ் குமார்)", "S/O Late Krishnamurthy\n(கிருஷ்ணமூர்த்தி)", "OBC — Vanniyar", "Full"],
    ]
    t = Table(owner_data, colWidths=[60, 155, 155, 90, 45])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_RED),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t.wrapOn(c, W - 30, 200)
    t.drawOn(c, 15, y - 55)
    y -= 73

    # Land details
    c.setFillColor(colors.HexColor("#880E4F"))
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "LAND DETAILS — நில விவரங்கள்")
    y -= 20

    land_data = [
        ["Survey No.", "Field Name", "Land Class / Natham", "Soil Type", "Area (Acres)", "Area (Hectares)"],
        ["123/4A", "Tea Plantation\n(தேயிலை தோட்டம்)", "Plantation Land\n(தோட்டம்)", "Red Laterite", "2.50 Acres", "1.012 Ha"],
        ["123/4B (Adj.)", "Fallow Land", "Dry (Punja)", "Clay-Loam", "0.80 Acres", "0.324 Ha"],
        ["TOTAL", "", "", "", "3.30 Acres", "1.336 Ha"],
    ]
    t2 = Table(land_data, colWidths=[55, 110, 110, 80, 75, 85])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#880E4F")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, LIGHT_GRAY]),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#FCE4EC")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t2.wrapOn(c, W - 30, 200)
    t2.drawOn(c, 15, y - 65)
    y -= 83

    # Mutation history
    c.setFillColor(colors.HexColor("#1A237E"))
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "MUTATION HISTORY — உரிமை மாற்றம் பதிவேடு")
    y -= 20

    mut_data = [
        ["Mutation No.", "Type of Mutation", "Previous Owner", "Date of Mutation", "Remarks"],
        ["M-8842/2024", "Inheritance\n(வாரிசு)", "Late Krishnamurthy\n(கிருஷ்ணமூர்த்தி)", "14-Feb-2024", "Probated Will;\nHigh Court Order\nHC/2023/4521"],
        ["M-5124/2019", "Sale Deed", "P. Ramasamy", "08-Jun-2019", "Registered at\nSRO Udhagamandalam"],
    ]
    t3 = Table(mut_data, colWidths=[70, 110, 130, 90, 115])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t3.wrapOn(c, W - 30, 200)
    t3.drawOn(c, 15, y - 68)
    y -= 86

    # Note: handwritten-style low-confidence field simulation
    c.setFillColor(colors.HexColor("#FFF9C4"))
    c.rect(15, y - 42, W - 30, 40, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#F57F17"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(25, y - 12, "⚠  VERIFIER NOTE (HITL FLAG): The Owner Name field contains both printed and handwritten Tamil script.")
    c.setFont("Helvetica", 7.5)
    c.drawString(25, y - 25, "OCR confidence < 0.60 for 'ரமேஷ் குமார்' — manual confirmation required before sealing the digital record.")
    c.drawString(25, y - 38, "Land Class: 'Plantation (Tea Garden / தேயிலை)' requires additional validation against NLRMP classification codes.")

    draw_stamp_box(c, W - 145, y - 42, "OFFICIAL SEAL\nSUB-REGISTRAR\nUDHAGAMANDALAM")
    draw_footer(c, "ka-2024-00453", "Tamil Nadu Revenue Department — TNREGINET / e-Patta System")

    c.save()
    print(f"✅ Generated: {path}")
    return path


# ─────────────────────────────────────────────────────────
# PDF 3: Rajasthan Jamabandi / Khatian (Hindi)
# ─────────────────────────────────────────────────────────
def generate_jamabandi_rajasthan():
    path = os.path.join(OUTPUT_DIR, "Jamabandi_Rajasthan_Barmer_Khasra482.pdf")
    c = canvas.Canvas(path, pagesize=A4)

    draw_watermark(c, "RAJASTHAN GOVT")
    draw_header_band(
        c,
        "राजस्थान सरकार — राजस्व विभाग  |  Government of Rajasthan — Revenue Department",
        "जमाबंदी / खतौनी — JAMABANDI / KHATIAN EXTRACT",
        "Issued under Rajasthan Land Revenue Act, 1956 · Patwari Certified Copy · Section 49",
        color=colors.HexColor("#BF360C")
    )

    c.setFillColor(colors.HexColor("#FBE9E7"))
    c.rect(15, H - 115, W - 30, 38, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#BF360C"))
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, H - 88, "District / जिला: Barmer (बाड़मेर)")
    c.drawString(220, H - 88, "Tehsil / तहसील: Chohtan (चौहटन)")
    c.drawString(25, H - 103, "Village / गाँव: Ramsar (रामसर)   |   Patwari Halka No.: 14")
    c.drawString(330, H - 103, "Khasra No.: 482/1")

    c.setFillColor(LIGHT_GRAY)
    c.rect(15, H - 155, W - 30, 35, fill=1, stroke=0)
    c.setFillColor(DARK_GRAY)
    c.setFont("Helvetica", 8)
    c.drawString(25, H - 132, "Khata No.: RJ-BRM-KH-0714")
    c.drawString(200, H - 132, "Khewat No.: 114")
    c.drawString(360, H - 132, "Khatouni No.: 214")
    c.drawString(25, H - 148, "Year: 2023-24   |   Language: Hindi (Devanagari)   |   Type: AGRICULTURAL LAND — DRYLAND (BARANI)")

    y = H - 175

    # Khatedar (Owner)
    c.setFillColor(colors.HexColor("#BF360C"))
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "KHATEDAR (TITLE HOLDER) — खातेदार (भूमिस्वामी) विवरण")
    y -= 20

    kh_data = [
        ["Sr.", "Khata No.", "Khatedar Name (Hindi)", "Father's Name", "Caste/Category", "Share"],
        ["1", "KH-0714", "Mangilal s/o Bhura Ram\n(मंगीलाल पुत्र भूरा राम)", "Bhura Ram\n(भूरा राम)", "SC — Meghwal", "1/2"],
        ["2", "KH-0714", "Ramkaran s/o Bhura Ram\n(रामकरण पुत्र भूरा राम)", "Bhura Ram\n(भूरा राम)", "SC — Meghwal", "1/2"],
    ]
    t = Table(kh_data, colWidths=[22, 52, 155, 130, 90, 45])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#BF360C")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t.wrapOn(c, W - 30, 200)
    t.drawOn(c, 15, y - 65)
    y -= 82

    # Khasra (Land parcels)
    c.setFillColor(colors.HexColor("#4E342E"))
    c.rect(15, y - 2, W - 30, 18, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(25, y + 3, "KHASRA REGISTER — खसरा पंजी (भूमि विवरण)")
    y -= 20

    khasra_data = [
        ["Khasra No.", "Land Class", "Crop (Kharif)", "Crop (Rabi)", "Area (Bigha)", "Area (Hectares)", "Revenue (₹)"],
        ["482/1", "Barani\n(बारानी — Dryland)", "Bajra\n(बाजरा)", "Wheat\n(गेहूँ)", "8 B 12 B", "2.84 Ha", "₹ 480"],
        ["482/2", "Gair-Mumkin\n(गैर मुमकिन — Wasteland)", "—", "—", "1 B 2 B", "0.40 Ha", "—"],
        ["TOTAL", "", "", "", "9 B 14 B", "3.24 Ha", "₹ 480"],
    ]
    t2 = Table(khasra_data, colWidths=[50, 85, 65, 65, 65, 80, 75])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4E342E")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, MID_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [WHITE, LIGHT_GRAY]),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#FBE9E7")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    t2.wrapOn(c, W - 30, 200)
    t2.drawOn(c, 15, y - 68)
    y -= 86

    # Remarks
    c.setFillColor(colors.HexColor("#E8F5E9"))
    c.rect(15, y - 50, W - 30, 48, fill=1, stroke=1)
    c.setFillColor(DEEP_GREEN)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(25, y - 10, "REMARKS / NOTES — टिप्पणी")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DARK_GRAY)
    c.drawString(25, y - 24, "1. Land is subject to MGNREGA bunding scheme — Rajasthan Watershed Development Authority, 2022.")
    c.drawString(25, y - 36, "2. Dispute Pending: Survey No. 482/1 — boundary dispute with adjacent Khasra 481/3 (Case No. RJ-BRM-BD-2023-0041).")
    c.drawString(25, y - 48, "3. PM Kisan Nidhi Beneficiary: Mangilal (Reg. PMKN-RJ-2022-884521). Verification with e-NAM portal required.")

    # Patwari certification
    c.setFillColor(colors.HexColor("#EDE7F6"))
    c.rect(15, y - 95, W - 30, 40, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#4527A0"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(25, y - 62, "PATWARI CERTIFICATION — पटवारी प्रमाणीकरण")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(DARK_GRAY)
    c.drawString(25, y - 75, "Certified that this is a true and correct extract from the Jamabandi register maintained for Village Ramsar, Halka 14.")
    c.drawString(25, y - 88, "Patwari: Shri Dilip Singh Rathore   |   Halka Patwari No.: 14   |   Date: 03-Sep-2024")
    draw_stamp_box(c, W - 145, y - 95, "CERTIFIED\nPATWARI HALKA 14\nCHOHTAN TEHSIL")

    draw_footer(c, "rj-2024-00891", "Rajasthan Revenue Department — Apna Khata / e-Dharti System")

    c.save()
    print(f"✅ Generated: {path}")
    return path


# ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Generating sample Indian land record PDFs...")
    p1 = generate_7_12_nashik()
    p2 = generate_patta_nilgiris()
    p3 = generate_jamabandi_rajasthan()
    print(f"\n✅ All 3 PDFs saved to: {OUTPUT_DIR}")
    print(f"   1. {os.path.basename(p1)}  → Maharashtra Form 7/12  (high confidence, VALIDATED type)")
    print(f"   2. {os.path.basename(p2)}  → Tamil Nadu ROR Patta  (low confidence owner name, NEEDS_REVIEW)")
    print(f"   3. {os.path.basename(p3)}  → Rajasthan Jamabandi   (disputed boundary, mixed confidence)")
