import re

# =========================================
# ELECTRICITY KEYWORDS
# =========================================

ELECTRICITY_KEYWORDS = [

    "transformer",
    "spark",
    "wire",
    "current",
    "shock",
    "blast",
    "electric",
    "voltage",
    "short circuit",
    "power",
    "live wire",
    "pole",
    "bijli",
    "karant",
    "electricity",
    "fire"
]

# =========================================
# ROADS KEYWORDS
# =========================================

ROADS_KEYWORDS = [

    "road",
    "pothole",
    "signal",
    "traffic",
    "accident",
    "gaddha",
    "street",
    "bridge",
    "highway",
    "manhole",
    "road damage",
    "broken road"
]

# =========================================
# WATER KEYWORDS
# =========================================

WATER_KEYWORDS = [

    "water",
    "pipeline",
    "leakage",
    "supply",
    "muddy water",
    "drain water",
    "pipe burst",
    "paani",
    "tap",
    "seepage"
]

# =========================================
# SANITATION KEYWORDS
# =========================================

SANITATION_KEYWORDS = [

    "garbage",
    "waste",
    "drain",
    "smell",
    "mosquito",
    "dirty",
    "sewer",
    "overflow",
    "kooda",
    "sanitation",
    "cleaning"
]

# =========================================
# PARKS KEYWORDS
# =========================================

PARKS_KEYWORDS = [

    "park",
    "bench",
    "playground",
    "gym",
    "street light",
    "garden",
    "public toilet",
    "park light"
]

# =========================================
# CLEAN TEXT
# =========================================

def clean_text(text):

    text = text.lower().strip()

    text = re.sub(
        r'\s+',
        ' ',
        text
    )

    return text

# =========================================
# EXTRACT CONTEXT
# =========================================

def extract_context(text):

    words = text.split()

    important_words = []

    for word in words:

        if len(word) > 3:

            important_words.append(word)

    return " ".join(
        important_words[:12]
    )

# =========================================
# GENERATE SMART SUMMARY
# =========================================

def generate_summary(text):

    text = clean_text(text)

    # =====================================
    # ELECTRICITY
    # =====================================

    if any(keyword in text for keyword in ELECTRICITY_KEYWORDS):

        return "Electrical safety issue reported involving possible power infrastructure risk."

    # =====================================
    # ROADS
    # =====================================

    if any(keyword in text for keyword in ROADS_KEYWORDS):

        return "Road and traffic infrastructure issue causing possible public safety concerns."

    # =====================================
    # WATER
    # =====================================

    if any(keyword in text for keyword in WATER_KEYWORDS):

        return "Water supply or pipeline issue affecting local residents."

    # =====================================
    # SANITATION
    # =====================================

    if any(keyword in text for keyword in SANITATION_KEYWORDS):

        return "Sanitation and waste management issue reported in the area."

    # =====================================
    # PARKS
    # =====================================

    if any(keyword in text for keyword in PARKS_KEYWORDS):

        return "Public infrastructure or park maintenance issue reported."

    # =====================================
    # FALLBACK
    # =====================================

    return extract_context(text)

# =========================================
# TESTING
# =========================================

if __name__ == "__main__":

    sample_texts = [

        "HELP!! bijli ka taar spark kar raha hai bachche bahar khel rahe hain jaldi aao",

        "Garbage has not been collected from our colony for the last 5 days and the smell is unbearable",

        "पानी की सप्लाई पिछले तीन दिनों से बंद है कृपया जल्दी ठीक करें",

        "রাস্তার মাঝে বড় গর্ত হয়েছে প্রতিদিন দুর্ঘটনা ঘটছে",

        "தயவு செய்து சாலையை சரிசெய்யுங்கள் pothole காரணமாக accident ஆகிறது"
    ]

    for text in sample_texts:

        summary = generate_summary(text)

        print("\nOriginal Complaint:")
        print(text)

        print("\nGenerated Summary:")
        print(summary)

        print("-" * 80)