import pdfplumber
import os

def extract_text_from_pdf(pdf_path):
    """Extract all text from a PDF file"""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at: {pdf_path}")
    
    print(f"📖 Reading PDF: {pdf_path}")
    
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"   Total pages: {total_pages}")
        
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                full_text += text + "\n"
            if (i + 1) % 10 == 0:
                print(f"   Processed {i + 1}/{total_pages} pages...")
    
    print(f"✅ Extracted {len(full_text)} characters from PDF")
    return full_text