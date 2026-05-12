import re

# =========================================
# PRIORITY KEYWORDS
# =========================================

CRITICAL_KEYWORDS = [

    "blast",
    "explosion",
    "fire",
    "sparking heavily",
    "shock",
    "electrocution",
    "current leak",
    "live wire",
    "danger",
    "urgent",
    "help",
    "emergency",
    "hanging wire",
    "pole fire",
    "transformer burst",
    "kids in danger",
    "fatal",
    "death",
    "smoke",
    "burning",
    "sparking",
    "short circuit",
    "aag",
    "धमाका",
    "आग",
    "करंट",
    "தீ",
    "আগুন"
]

HIGH_KEYWORDS = [

    "spark",
    "overflow",
    "huge pothole",
    "accident",
    "broken signal",
    "waterlogging",
    "blocked drain",
    "dirty water",
    "contaminated water",
    "fallen pole",
    "unsafe",
    "dangerous",
    "dark road",
    "gaddha",
    "खड्डा",
    "dangerous road",
    "bad smell",
    "mosquito",
    "overflowing garbage",
    "open manhole",
    "toxic"
]

MEDIUM_KEYWORDS = [

    "not working",
    "damaged",
    "garbage not collected",
    "low pressure",
    "water issue",
    "street light off",
    "bench broken",
    "tap leaking",
    "drain clogged",
    "road damaged",
    "maintenance",
    "repair needed",
    "issue",
    "problem",
    "broken"
]

# =========================================
# DETECT PRIORITY
# =========================================

def detect_priority(text):

    text = text.lower()

    # =====================================
    # CRITICAL
    # =====================================

    for keyword in CRITICAL_KEYWORDS:

        if keyword in text:

            return "Critical"

    # =====================================
    # HIGH
    # =====================================

    for keyword in HIGH_KEYWORDS:

        if keyword in text:

            return "High"

    # =====================================
    # MEDIUM
    # =====================================

    for keyword in MEDIUM_KEYWORDS:

        if keyword in text:

            return "Medium"

    # =====================================
    # EXTRA PANIC CHECKS
    # =====================================

    exclamation_count = text.count("!")

    capital_words = re.findall(r'\b[A-Z]{3,}\b', text)

    if exclamation_count >= 3:

        return "High"

    if len(capital_words) >= 2:

        return "High"

    # =====================================
    # DEFAULT
    # =====================================

    return "Low"

# =========================================
# TESTING
# =========================================

if __name__ == "__main__":

    sample_texts = [

        "Transformer blast ho gaya urgent help",

        "Road pe bada gaddha hai",

        "Water supply low pressure",

        "Park bench broken",

        "LIVE WIRE SPARKING HELP!!!"
    ]

    for text in sample_texts:

        priority = detect_priority(text)

        print(f"\nComplaint: {text}")

        print(f"Priority: {priority}")