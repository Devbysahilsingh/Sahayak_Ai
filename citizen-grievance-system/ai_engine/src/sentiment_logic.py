import re

# =========================================
# CRITICAL PANIC OVERRIDE
# =========================================
# These ALWAYS trigger Panic
# regardless of pleading words.
# =========================================

CRITICAL_PANIC_WORDS = [

    "blast",
    "explosion",
    "fire",
    "live wire",
    "current leak",
    "electrocution",
    "transformer blast",
    "sparking",
    "shock",
    "danger",
    "dangerous",
    "short circuit",
    "fatal",
    "emergency",
    "urgent",
    "help",
    "save us",

    # Hindi / Hinglish

    "aag",
    "dhamaaka",
    "karant",
    "jaan ka khatra",
    "bachao",

    # Bengali

    "আগুন",
    "বাঁচান",

    # Tamil

    "தீ",
    "ஆபத்து"
]

# =========================================
# PANIC KEYWORDS
# =========================================

PANIC_KEYWORDS = [

    "danger",
    "dangerous",
    "blast",
    "explosion",
    "fire",
    "sparking",
    "shock",
    "people screaming",
    "kids in danger",
    "immediately",
    "dying",
    "collapse",
    "terrified",
    "transformer blast",

    # Hinglish

    "jaldi aao",
    "current lag raha",
    "bijli ka jhatka",

    # Bengali

    "বিপদ",

    # Tamil

    "உதவி"
]

# =========================================
# ANGRY KEYWORDS
# =========================================

ANGRY_KEYWORDS = [

    # English

    "worst",
    "useless",
    "irresponsible",
    "pathetic",
    "fed up",
    "again",
    "still not fixed",
    "no action",
    "careless",
    "waste service",
    "frustrated",
    "angry",
    "disgusting",
    "third class",
    "ridiculous",
    "complaining since",
    "nothing happened",
    "tired of this",
    "bad service",

    # Hinglish

    "kab se bol raha",
    "koi sunwai nahi",
    "bekar",
    "faltu",
    "ghatiya",
    "bahut ho gaya",
    "abhi tak nahi hua",

    # Hindi

    "गुस्सा",
    "बेकार",
    "निकम्मा",

    # Bengali

    "খুব খারাপ",

    # Tamil

    "மோசம்"
]

# =========================================
# PLEADING KEYWORDS
# =========================================

PLEADING_KEYWORDS = [

    # English

    "please",
    "kindly",
    "request",
    "please help",
    "please resolve",
    "humble request",
    "need help",
    "looking for support",
    "please send someone",
    "please repair",
    "waiting for help",
    "please fix",
    "please sir",
    "requesting you",

    # Hinglish

    "plz",
    "kripya",
    "please bhaiya",
    "madad karo",
    "request hai",
    "please karo",
    "fix karo",
    "sahi karo",

    # Hindi

    "कृपया",
    "मदद",
    "सुधार दीजिए",

    # Bengali

    "দয়া করে",

    # Tamil

    "தயவு செய்து"
]

# =========================================
# EXTRA PANIC PATTERNS
# =========================================

PANIC_PATTERNS = [

    r'!{3,}',

    r'\b[A-Z]{4,}\b',

    r'urgent+',

    r'help+',

    r'save+'
]

# =========================================
# CLEAN TEXT
# =========================================

def clean_text(text):

    text = text.lower().strip()

    return text

# =========================================
# DETECT PLEADING
# =========================================

def detect_pleading(text):

    for keyword in PLEADING_KEYWORDS:

        if keyword.lower() in text:

            return True

    return False

# =========================================
# DETECT PANIC
# =========================================

def detect_panic(text):

    # Keyword Match

    for keyword in PANIC_KEYWORDS:

        if keyword.lower() in text:

            return True

    # Regex Pattern Match

    for pattern in PANIC_PATTERNS:

        if re.search(pattern, text):

            return True

    return False

# =========================================
# DETECT ANGRY
# =========================================

def detect_angry(text):

    for keyword in ANGRY_KEYWORDS:

        if keyword.lower() in text:

            return True

    return False

# =========================================
# MAIN SENTIMENT FUNCTION
# =========================================

def detect_sentiment(text):

    original_text = text

    text = clean_text(text)

    # =====================================
    # HARD PANIC OVERRIDE
    # =====================================

    for word in CRITICAL_PANIC_WORDS:

        if word.lower() in text:

            return "Panic"

    # =====================================
    # PLEADING
    # =====================================

    if detect_pleading(text):

        return "Pleading"

    # =====================================
    # NORMAL PANIC
    # =====================================

    if detect_panic(original_text):

        return "Panic"

    # =====================================
    # ANGRY
    # =====================================

    if detect_angry(text):

        return "Angry"

    # =====================================
    # DEFAULT
    # =====================================

    return "Neutral"

# =========================================
# TESTING
# =========================================

if __name__ == "__main__":

    sample_texts = [

        # Panic

        "HELP transformer blast ho gaya!!!",

        "Current leak ho raha hai bachao",

        "Fire near electric pole urgent",

        # Angry

        "Garbage still not collected useless service",

        "Bahut ho gaya koi sunwai nahi",

        "Worst road maintenance ever",

        # Pleading

        "Please repair road near school",

        "Please Sir pothole fix karo",

        "தயவு செய்து சாலையை சரிசெய்யுங்கள்",

        # Neutral

        "Street light not working",

        "Water supply issue in ward 4"
    ]

    for text in sample_texts:

        sentiment = detect_sentiment(text)

        print("\nComplaint:")
        print(text)

        print("\nSentiment:")
        print(sentiment)

        print("-" * 60) 