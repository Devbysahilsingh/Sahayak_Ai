import re
import os

import torch


HINGLISH_GLOSSARY = {
    "paani": "water",
    "pani": "water",
    "bijli": "electricity",
    "light": "electricity light",
    "kachra": "garbage",
    "kuda": "garbage",
    "koora": "garbage",
    "nala": "drain",
    "naali": "drain",
    "gutter": "drain",
    "sadak": "road",
    "gaddha": "pothole",
    "khadda": "pothole",
    "kutte": "dogs",
    "kutta": "dog",
    "aspatal": "hospital",
    "bimaar": "sick",
    "bimar": "sick",
    "aag": "fire",
    "dhua": "smoke",
    "dhuaa": "smoke",
    "mahila": "women",
    "ladki": "girl",
    "ladkiyan": "girls",
    "unsafe": "unsafe",
    "madad": "help",
    "turant": "urgent",
    "jaldi": "urgent",
    "sarkari": "government",
    "shikayat": "complaint",
    "ghar": "home private",
    "pankha": "fan private appliance",
    "ac": "ac private appliance",
    "inverter": "inverter private appliance",
    "fridge": "refrigerator private appliance",
    "aadhaar": "aadhaar document manual review",
    "aadhar": "aadhaar document manual review",
    "ration": "ration card document manual review",
    "certificate": "certificate document manual review",
    "pension": "pension welfare manual review",
    "khana": "food manual review",
    "basi": "stale food manual review",
    "thela": "food stall manual review",
    "dukan": "shop",
    "signal": "traffic signal",
    "jam": "traffic jam",
    "peecha": "harassment women safety",
    "cheda": "harassment women safety",
    "ched": "harassment women safety",
    "sandeh": "suspicious police safety",
}

MULTILINGUAL_PHRASES = {
    "சாலை": "road",
    "தோண்டியதால்": "digging",
    "குடிநீர்": "drinking water",
    "குழாய்": "pipeline",
    "உடைந்து": "broken",
    "மாசான": "dirty contaminated",
    "நீர்": "water",
    "வீடுகளுக்கு": "houses",
    "வருகிறது": "coming",
    "রাস্তা": "road",
    "খোঁড়ার": "digging",
    "পানির": "water",
    "পাইপ": "pipeline",
    "ভেঙে": "broken",
    "নোংরা": "dirty contaminated",
    "পানি": "water",
    "বাড়িতে": "houses",
    "ঢুকছে": "entering",
    "सड़क": "road",
    "खुदाई": "digging",
    "पानी": "water",
    "पाइप": "pipeline",
    "टूट": "broken",
    "गंदा": "dirty contaminated",
    "घर": "home private",
    "AC": "AC private appliance",
    "एसी": "AC private appliance",
    "ठंडा": "cooling",
    "सरकारी": "government",
    "शिकायत": "complaint",
}

MULTILINGUAL_PHRASES.update(
    {
        "घर": "home private",
        "मेरा घर": "my home private",
        "पंखा": "fan private appliance",
        "एसी": "ac private appliance",
        "इन्वर्टर": "inverter private appliance",
        "फ्रिज": "refrigerator private appliance",
        "आधार": "aadhaar document manual review",
        "राशन": "ration card document manual review",
        "प्रमाणपत्र": "certificate document manual review",
        "सर्टिफिकेट": "certificate document manual review",
        "पेंशन": "pension welfare manual review",
        "योजना": "welfare scheme manual review",
        "खाना": "food manual review",
        "बासी": "stale food manual review",
        "ठेला": "food stall manual review",
        "ट्रैफिक सिग्नल": "traffic signal",
        "सिग्नल": "traffic signal",
        "जाम": "traffic jam",
        "संदिग्ध": "suspicious police safety",
        "पीछा": "harassment women safety",
        "छेड़": "harassment women safety",
        "महिलाओं": "women",
        "लड़कियों": "girls",
        "कचरा": "garbage",
        "नहीं आई": "not collected",
        "রাস্তা": "road",
        "খোঁড়": "digging",
        "পানি": "water",
        "পানির": "water",
        "পাইপ": "pipeline",
        "ভেঙে": "broken",
        "নোংরা": "dirty contaminated",
        "ড্রেন": "drain sewer",
        "বন্ধ": "blocked",
        "বৃষ্টির জল": "rain water",
        "আবর্জনা": "garbage",
        "কুকুর": "dog animal",
        "আধার": "aadhaar document manual review",
        "রেশন": "ration card document manual review",
        "সার্টিফিকেট": "certificate document manual review",
        "পেনশন": "pension welfare manual review",
        "বাসি খাবার": "stale food manual review",
        "খাবার": "food manual review",
        "கால்வாய்": "drain sewer",
        "அடைப்பு": "blocked",
        "கழிவுநீர்": "sewage",
        "குப்பை": "garbage",
        "தெரு விளக்கு": "street light",
        "பெண்களுக்கு": "women",
        "பாதுகாப்பு": "safety",
        "ஆதார்": "aadhaar document manual review",
        "ரேஷன்": "ration card document manual review",
        "சான்றிதழ்": "certificate document manual review",
        "ஓய்வூதியம்": "pension welfare manual review",
        "பழைய உணவு": "stale food manual review",
        "உணவு": "food manual review",
    }
)

MULTILINGUAL_PHRASES.update(
    {
        "ਪਾਣੀ": "water",
        "ਪਾਈਪ": "pipeline",
        "ਗੰਦਾ": "dirty contaminated",
        "ਘਰ": "home private",
        "ਪੱਖਾ": "fan private appliance",
        "ਸੜਕ": "road",
        "ਖੱਡਾ": "pothole",
        "ਕੂੜਾ": "garbage",
        "ਬੀਮਾਰ": "sick",
        "ਬਿਜਲੀ": "electricity",
        "ਥਾਂਭਲਾ": "electric pole",
        "ਸਟ੍ਰੀਟ ਲਾਈਟ": "street light",
        "ਔਰਤਾਂ": "women",
        "રસ્તા": "road",
        "ખાડો": "pothole",
        "અકસ્મા": "accident",
        "નળ": "tap",
        "ગંદુ પાણી": "dirty water",
        "દુર્ગંધ": "bad smell",
        "ઘર": "home private",
        "એસી": "ac private appliance",
        "કચરો": "garbage",
        "મચ્છર": "mosquito",
        "વીજળી": "electricity",
        "થાંભલો": "electric pole",
        "రోడ్డు": "road",
        "గుంత": "pothole",
        "కాలువ": "drain sewer",
        "మురుగు": "sewage",
        "నీరు": "water",
        "ఇంటి": "home private",
        "ఫ్రిజ్": "refrigerator private appliance",
        "వీధి దీపం": "street light",
        "మహిళలు": "women",
        "చెత్త": "garbage",
        "విద్యుత్": "electricity",
        "కంబం": "electric pole",
        "ರಸ್ತೆ": "road",
        "ಗುಂಡಿ": "pothole",
        "ಕುಡಿಯುವ ನೀರು": "drinking water",
        "ಒಳಚರಂಡಿ": "drain sewer",
        "ಮನೆಯ": "home private",
        "ಫ್ಯಾನ್": "fan private appliance",
        "ಕಸ": "garbage",
        "ವಿದ್ಯುತ್": "electricity",
        "ಕಂಬ": "electric pole",
        "റോഡ്": "road",
        "കുഴി": "pothole",
        "കുടിവെള്ളം": "drinking water",
        "മലിനജലം": "sewage",
        "വീട്": "home private",
        "ഫ്രിഡ്ജ്": "refrigerator private appliance",
        "തെരുവ് ലൈറ്റ്": "street light",
        "സ്ത്രീകൾ": "women",
        "മാലിന്യം": "garbage",
        "വൈദ്യുതി": "electricity",
    }
)

LANGUAGE_ALIASES = {
    "assamese": "Assamese",
    "as": "Assamese",
    "bengali": "Bengali",
    "bangla": "Bengali",
    "bn": "Bengali",
    "bodo": "Bodo",
    "dogri": "Dogri",
    "gujarati": "Gujarati",
    "gu": "Gujarati",
    "hindi": "Hindi",
    "hi": "Hindi",
    "kannada": "Kannada",
    "kn": "Kannada",
    "kashmiri": "Kashmiri",
    "konkani": "Konkani",
    "maithili": "Maithili",
    "malayalam": "Malayalam",
    "ml": "Malayalam",
    "manipuri": "Manipuri",
    "meitei": "Manipuri",
    "marathi": "Marathi",
    "mr": "Marathi",
    "nepali": "Nepali",
    "ne": "Nepali",
    "odia": "Odia",
    "oriya": "Odia",
    "or": "Odia",
    "punjabi": "Punjabi",
    "panjabi": "Punjabi",
    "pa": "Punjabi",
    "sanskrit": "Sanskrit",
    "santali": "Santali",
    "sindhi": "Sindhi",
    "tamil": "Tamil",
    "ta": "Tamil",
    "telugu": "Telugu",
    "te": "Telugu",
    "urdu": "Urdu",
    "ur": "Urdu",
    "english": "English",
    "en": "English",
    "hinglish": "Hinglish",
}

SCRIPT_RANGES = {
    "Hindi": ("\u0900", "\u097f"),
    "Bengali": ("\u0980", "\u09ff"),
    "Punjabi": ("\u0a00", "\u0a7f"),
    "Gujarati": ("\u0a80", "\u0aff"),
    "Odia": ("\u0b00", "\u0b7f"),
    "Tamil": ("\u0b80", "\u0bff"),
    "Telugu": ("\u0c00", "\u0c7f"),
    "Kannada": ("\u0c80", "\u0cff"),
    "Malayalam": ("\u0d00", "\u0d7f"),
    "Sinhala": ("\u0d80", "\u0dff"),
    "Urdu": ("\u0600", "\u06ff"),
    "Santali": ("\u1c50", "\u1c7f"),
    "Manipuri": ("\uab00", "\uab2f"),
}

MOJIBAKE_MARKERS = ("à", "Â", "Ã", "�", "ðŸ")
NLLB_MODEL_NAME = os.getenv("TRANSLATION_MODEL_NAME", "facebook/nllb-200-distilled-600M")
ENABLE_LOCAL_TRANSLATION = os.getenv("ENABLE_LOCAL_TRANSLATION", "false").lower() == "true"
NLLB_LANGUAGE_CODES = {
    "Assamese": "asm_Beng",
    "Bengali": "ben_Beng",
    "Bodo": "brx_Deva",
    "Dogri": "dgo_Deva",
    "Gujarati": "guj_Gujr",
    "Hindi": "hin_Deva",
    "Kannada": "kan_Knda",
    "Kashmiri": "kas_Arab",
    "Konkani": "gom_Deva",
    "Maithili": "mai_Deva",
    "Malayalam": "mal_Mlym",
    "Marathi": "mar_Deva",
    "Manipuri": "mni_Beng",
    "Nepali": "npi_Deva",
    "Odia": "ory_Orya",
    "Punjabi": "pan_Guru",
    "Sanskrit": "san_Deva",
    "Santali": "sat_Olck",
    "Sindhi": "snd_Arab",
    "Tamil": "tam_Taml",
    "Telugu": "tel_Telu",
    "Urdu": "urd_Arab",
}
_translation_model = None
_translation_tokenizer = None


def clean_text(value):
    return " ".join(str(value or "").strip().split())


def has_script(text, language):
    start, end = SCRIPT_RANGES[language]
    return any(start <= char <= end for char in text)


def script_count(text, language):
    start, end = SCRIPT_RANGES[language]
    return sum(1 for char in text if start <= char <= end)


def looks_corrupted(text):
    return any(marker in text for marker in MOJIBAKE_MARKERS)


def detect_language(text, declared_language=""):
    text = clean_text(text)
    declared = clean_text(declared_language)
    declared_normalized = LANGUAGE_ALIASES.get(declared.lower(), declared)
    if looks_corrupted(text):
        return "Corrupted"
    if declared_normalized in {"English", "Hinglish"} or declared_normalized in NLLB_LANGUAGE_CODES:
        return declared_normalized
    script_counts = {
        language: script_count(text, language)
        for language in SCRIPT_RANGES
    }
    best_language, best_count = max(script_counts.items(), key=lambda item: item[1])
    if best_count:
        return best_language
    lower = text.lower()
    if declared.lower() == "hinglish" or any(word in lower.split() for word in HINGLISH_GLOSSARY):
        return "Hinglish"
    return declared_normalized or "English"


def normalize_hinglish(text):
    normalized = clean_text(text)
    for source, replacement in HINGLISH_GLOSSARY.items():
        normalized = re.sub(rf"\b{re.escape(source)}\b", replacement, normalized, flags=re.IGNORECASE)
    return normalized


def normalize_multilingual_keywords(text):
    normalized = clean_text(text)
    for source, replacement in MULTILINGUAL_PHRASES.items():
        normalized = normalized.replace(source, f" {replacement} ")
    return clean_text(normalize_hinglish(normalized))


def make_label_based_translation(row):
    primary = row.get("primary_department", "civic")
    secondary = row.get("secondary_departments", "None")
    priority = row.get("priority_level", "Medium")
    authenticity = row.get("authenticity_label", "Genuine")
    fake_category = row.get("fake_category", "None")
    if authenticity != "Genuine":
        return f"Non-government or invalid complaint. Category: {fake_category}. This should not be routed to a civic department."
    if secondary and str(secondary).lower() not in {"none", "nan"}:
        return f"{priority} public grievance involving {primary} and {secondary}. Citizen reports a civic issue needing coordinated department action."
    return f"{priority} public grievance related to {primary}. Citizen reports a civic issue needing government action."


def get_translation_components():
    global _translation_model, _translation_tokenizer
    if _translation_model and _translation_tokenizer:
        return _translation_tokenizer, _translation_model
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    _translation_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_NAME)
    _translation_model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL_NAME)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _translation_model.to(device)
    _translation_model.eval()
    return _translation_tokenizer, _translation_model


def translate_to_english(text, language):
    if not ENABLE_LOCAL_TRANSLATION or language not in NLLB_LANGUAGE_CODES:
        return clean_text(text), "original_or_multilingual_model"
    try:
        tokenizer, model = get_translation_components()
        source_language_code = NLLB_LANGUAGE_CODES[language]
        supported_codes = getattr(tokenizer, "lang_code_to_id", {})
        if supported_codes and source_language_code not in supported_codes:
            return clean_text(text), "translation_language_not_supported_original_used"
        tokenizer.src_lang = source_language_code
        device = next(model.parameters()).device
        inputs = tokenizer(clean_text(text), return_tensors="pt", truncation=True, max_length=256).to(device)
        forced_bos_token_id = tokenizer.convert_tokens_to_ids("eng_Latn")
        with torch.no_grad():
            generated = model.generate(
                **inputs,
                forced_bos_token_id=forced_bos_token_id,
                max_length=256,
            )
        return tokenizer.batch_decode(generated, skip_special_tokens=True)[0], "nllb_local"
    except Exception:
        return clean_text(text), "translation_failed_original_used"


def prepare_classifier_text(row):
    text = clean_text(row.get("complaint_text", ""))
    language = detect_language(text, row.get("language", ""))
    if language in {"English", ""}:
        return text, language, text
    if language == "Hinglish":
        normalized = normalize_hinglish(text)
        return normalized, language, normalized
    translated = make_label_based_translation(row)
    return translated, language, translated


def preprocess_runtime_text(text, declared_language=""):
    language = detect_language(text, declared_language)
    if language == "Hinglish":
        return {
            "language": language,
            "translated_text": normalize_hinglish(text),
            "classifier_text": normalize_hinglish(text),
            "translation_source": "hinglish_glossary",
        }
    if language not in {"English", "Corrupted"}:
        translated, source = translate_to_english(text, language)
        if source != "nllb_local":
            translated = normalize_multilingual_keywords(translated)
            source = f"{source}_keyword_glossary"
        return {
            "language": language,
            "translated_text": translated,
            "classifier_text": translated,
            "translation_source": source,
        }
    return {
        "language": language,
        "translated_text": clean_text(text),
        "classifier_text": clean_text(text),
        "translation_source": "original_or_multilingual_model",
    }
