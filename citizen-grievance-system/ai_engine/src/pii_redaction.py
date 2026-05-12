import re

# =========================================
# PHONE NUMBER PATTERN
# =========================================

PHONE_PATTERN = re.compile(
    r'(\+91[\-\s]?)?[6-9]\d{9}'
)

# =========================================
# EMAIL PATTERN
# =========================================

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
)

# =========================================
# AADHAAR PATTERN
# =========================================

AADHAAR_PATTERN = re.compile(
    r'\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b'
)

# =========================================
# URL PATTERN
# =========================================

URL_PATTERN = re.compile(
    r'https?://\S+|www\.\S+'
)

# =========================================
# MULTILINGUAL NAME PATTERNS
# =========================================

NAME_PATTERNS = [

    # =====================================
    # ENGLISH
    # =====================================

    re.compile(
        r'\b(my name is|i am|this is)\s+([a-zA-Z]+\s?[a-zA-Z]*)',
        re.IGNORECASE
    ),

    # =====================================
    # HINGLISH
    # =====================================

    re.compile(
        r'\b(mera naam|mai hu|main hu)\s+([a-zA-Z]+\s?[a-zA-Z]*)',
        re.IGNORECASE
    ),

    # =====================================
    # HINDI
    # =====================================

    re.compile(
        r'(मेरा नाम)\s+([\u0900-\u097F]+\s?[\u0900-\u097F]*)'
    ),

    # =====================================
    # MARATHI
    # =====================================

    re.compile(
        r'(माझं नाव)\s+([\u0900-\u097F]+\s?[\u0900-\u097F]*)'
    ),

    # =====================================
    # BENGALI
    # =====================================

    re.compile(
        r'(আমার নাম)\s+([\u0980-\u09FF]+\s?[\u0980-\u09FF]*)'
    ),

    # =====================================
    # TAMIL
    # =====================================

    re.compile(
        r'(என் பெயர்)\s+([\u0B80-\u0BFF]+\s?[\u0B80-\u0BFF]*)'
    )
]

# =========================================
# MAIN REDACTION FUNCTION
# =========================================

def redact_pii(text):

    # =====================================
    # REDACT PHONE NUMBERS
    # =====================================

    text = PHONE_PATTERN.sub(
        '[PHONE REDACTED]',
        text
    )

    # =====================================
    # REDACT EMAILS
    # =====================================

    text = EMAIL_PATTERN.sub(
        '[EMAIL REDACTED]',
        text
    )

    # =====================================
    # REDACT AADHAAR
    # =====================================

    text = AADHAAR_PATTERN.sub(
        '[AADHAAR REDACTED]',
        text
    )

    # =====================================
    # REDACT URLS
    # =====================================

    text = URL_PATTERN.sub(
        '[URL REDACTED]',
        text
    )

    # =====================================
    # REDACT MULTILINGUAL NAMES
    # =====================================

    for pattern in NAME_PATTERNS:

        def replace_name(match):

            prefix = match.group(1)

            return f"{prefix} [NAME REDACTED]"

        text = pattern.sub(
            replace_name,
            text
        )

    # =====================================
    # RETURN CLEANED TEXT
    # =====================================

    return text

# =========================================
# TESTING
# =========================================

if __name__ == "__main__":

    sample_texts = [

        # English

        "My name is Sahil Singh and my number is 9876543210",

        # Hinglish

        "Mera naam Sahil hai aur mera number 9876543210 hai",

        # Hindi

        "मेरा नाम साहिल है और मेरा नंबर 9876543210 है",

        # Marathi

        "माझं नाव साहिल आहे",

        # Bengali

        "আমার নাম সাহিল",

        # Tamil

        "என் பெயர் சாஹில்",

        # Email

        "Contact me at sahil@gmail.com",

        # Aadhaar

        "My Aadhaar is 1234 5678 9012",

        # URL

        "visit https://example.com urgently"
    ]

    for text in sample_texts:

        print("\nOriginal:")
        print(text)

        print("\nRedacted:")
        print(redact_pii(text))

        print("-" * 60)