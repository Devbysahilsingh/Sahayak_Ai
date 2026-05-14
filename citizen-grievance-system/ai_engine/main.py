import json
import os
from pathlib import Path
import tempfile
import torch

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")
BASE_DIR = Path(__file__).resolve().parent

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
)

# =========================================
# IMPORT PRIORITY LOGIC
# =========================================

from src.priority_logic import detect_priority

# =========================================
# IMPORT PII REDACTION
# =========================================

from src.pii_redaction import redact_pii

# =========================================
# IMPORT SENTIMENT LOGIC
# =========================================

from src.sentiment_logic import detect_sentiment

# =========================================
# IMPORT AI SUMMARIZER
# =========================================

from src.summarizer import generate_summary
from src.text_preprocessing import preprocess_runtime_text

# =========================================
# FASTAPI APP
# =========================================

app = FastAPI(
    title="AI Grievance Intelligence Engine",
    version="7.0"
)

# =========================================
# LOAD MODEL PATH
# =========================================

PIPELINE_PATH = Path(os.getenv("PIPELINE_PATH", BASE_DIR / "models" / "grievance_pipeline"))

DEPARTMENT_NAME_MAP = {
    "Water Supply": "Water Supply",
    "Drainage & Flood Control": "Drainage & Flood Control",
    "Electricity": "Electricity",
    "Roads & Traffic": "Roads & Traffic",
    "Street Lighting": "Street Lighting",
    "Sanitation & Waste": "Sanitation & Waste",
    "Public Safety & Police": "Public Safety & Police",
    "Women & Child Safety": "Women & Child Safety",
    "Cyber & Digital Services": "Cyber & Digital Services",
    "Pollution Control": "Pollution Control",
    "Animal Control": "Animal Control",
    "Health & Public Hygiene": "Health & Public Hygiene",
    "Fire Department": "Fire Department",
    "Urban Housing & Encroachment": "Urban Housing & Encroachment",
    "Public Transport": "Public Transport",
    "Disaster Management": "Disaster Management",
    "Public Parks & Infrastructure": "Public Parks & Infrastructure",
    "Emergency Medical Response": "Emergency Medical Response",
    "Not Applicable": "Not Applicable",
    "Manual Review": "Manual Review",
}

def load_label_mapping(path):
    with (path / "label_mapping.json").open("r", encoding="utf-8") as file:
        return json.load(file)


def load_pipeline_model(name):
    path = PIPELINE_PATH / name
    if not path.exists():
        return None
    try:
        return {
            "tokenizer": AutoTokenizer.from_pretrained(str(path)),
            "model": AutoModelForSequenceClassification.from_pretrained(str(path)),
            "labels": load_label_mapping(path),
        }
    except Exception as exc:
        print(f"Could not load {name}; falling back to rules: {exc}")
        return None


print("Checking new AI pipeline models...")

validity_pipeline = load_pipeline_model("validity_model")
department_pipeline = load_pipeline_model("department_model")
priority_pipeline = load_pipeline_model("priority_model")
pipeline_ready = bool(validity_pipeline and department_pipeline and priority_pipeline)
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")
_whisper_model = None

# =========================================
# GPU / CPU SUPPORT
# =========================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

for pipeline in [validity_pipeline, department_pipeline, priority_pipeline]:
    if pipeline:
        pipeline["model"].to(device)
        pipeline["model"].eval()

print(f"\nUsing Device: {device}")
print(f"New pipeline ready: {pipeline_ready}")

# =========================================
# REQUEST MODEL
# =========================================

class ComplaintRequest(BaseModel):

    text: str
    language: str = ""


class BatchComplaintRequest(BaseModel):

    texts: list[str]
    language: str = ""

# =========================================
# ROOT ENDPOINT
# =========================================

@app.get("/")

def home():

    return {

        "message": "AI Grievance Intelligence Engine Running",

        "features": [

            "Department Classification",

            "Fake / Non-Government Complaint Detection",

            "Multi-Department Routing",

            "Priority Detection",

            "Sentiment Analysis",

            "PII Redaction",

            "AI Summarization"
        ],

        "new_pipeline_ready": pipeline_ready
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "new_pipeline_ready": pipeline_ready,
        "device": str(device),
        "whisper_model_size": WHISPER_MODEL_SIZE,
    }

# =========================================
# DEPARTMENT PREDICTION FUNCTION
# =========================================

def run_sequence_model(pipeline, text, max_length=160):
    inputs = pipeline["tokenizer"](
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=max_length,
    )
    inputs = {key: value.to(device) for key, value in inputs.items()}
    with torch.no_grad():
        return pipeline["model"](**inputs).logits


def predict_with_pipeline(text):
    validity_logits = run_sequence_model(validity_pipeline, text)
    validity_probs = torch.nn.functional.softmax(validity_logits, dim=-1)[0]
    valid_confidence = validity_probs[1].item()
    is_valid = valid_confidence >= 0.5

    priority_logits = run_sequence_model(priority_pipeline, text)
    priority_probs = torch.nn.functional.softmax(priority_logits, dim=-1)[0]
    priority_index = torch.argmax(priority_probs).item()
    predicted_priority = priority_pipeline["labels"][str(priority_index)]

    if not is_valid:
        result = {
            "is_valid_grievance": False,
            "authenticity": "Fake",
            "department": "Not Applicable",
            "departments": ["Not Applicable"],
            "primary_department": "Not Applicable",
            "secondary_departments": [],
            "priority": predicted_priority,
            "sentiment": detect_sentiment(text),
            "summary": generate_summary(text),
            "confidence": round(valid_confidence, 4),
            "validity_confidence": round(valid_confidence, 4),
            "department_confidence": 0.0,
            "message": "This appears to be a private, fake, spam, or non-government issue.",
        }
        return apply_demo_safety_rules(text, result)

    department_logits = run_sequence_model(department_pipeline, text)
    department_probs = torch.sigmoid(department_logits)[0]
    selected = [
        (department_pipeline["labels"][str(index)], probability.item())
        for index, probability in enumerate(department_probs)
        if probability.item() >= 0.45
    ]
    if not selected:
        best_index = torch.argmax(department_probs).item()
        selected = [(department_pipeline["labels"][str(best_index)], department_probs[best_index].item())]

    selected = sorted(selected, key=lambda item: item[1], reverse=True)
    departments = [label for label, _ in selected if label != "Not Applicable"]
    if not departments:
        departments = ["Manual Review"]

    result = {
        "is_valid_grievance": True,
        "authenticity": "Genuine",
        "department": departments[0],
        "departments": departments,
        "primary_department": departments[0],
        "secondary_departments": departments[1:],
        "priority": predicted_priority,
        "sentiment": detect_sentiment(text),
        "summary": generate_summary(text),
        "confidence": round(selected[0][1], 4),
        "validity_confidence": round(valid_confidence, 4),
        "department_confidence": round(selected[0][1], 4),
    }
    return apply_demo_safety_rules(text, result)


def apply_demo_safety_rules(text, result):
    lower = text.lower()

    manual_review_terms = [
        "aadhaar",
        "aadhar",
        "ration card",
        "certificate",
        "birth certificate",
        "caste certificate",
        "income certificate",
        "domicile certificate",
        "pension",
        "welfare scheme",
        "stale food",
        "unsafe food",
        "food stall",
        "food shop",
        "hygiene violation",
    ]
    if any(term in lower for term in manual_review_terms):
        food_manual_review = any(
            term in lower
            for term in ["stale food", "unsafe food", "food stall", "food shop", "hygiene violation"]
        )
        result.update(
            {
                "is_valid_grievance": True,
                "authenticity": "Genuine",
                "department": "Manual Review",
                "departments": ["Manual Review"],
                "primary_department": "Manual Review",
                "secondary_departments": [],
                "priority": "High" if food_manual_review else result.get("priority", "Low"),
                "confidence": 0.88,
                "validity_confidence": max(result.get("validity_confidence", 0), 0.88),
                "department_confidence": 0.88,
                "message": "This complaint needs manual review because its exact department is outside the trained department set.",
            }
        )
        return result

    private_terms = [
        "bedroom fan",
        "home fan",
        "my fan",
        "fan stopped",
        "fan is not working",
        "fan noise",
        "private wifi",
        "wifi slow",
        "router",
        "ac private",
        "ac is broken",
        "ac cooling",
        "ac not cooling",
        "air conditioner",
        "inverter backup",
        "my inverter",
        "ghar ka inverter",
        "private appliance",
        "refrigerator",
        "fridge",
        "compressor",
        "tv remote",
        "mobile charger",
    ]
    if any(term in lower for term in private_terms):
        result.update(
            {
                "is_valid_grievance": False,
                "authenticity": "Fake",
                "department": "Not Applicable",
                "departments": ["Not Applicable"],
                "primary_department": "Not Applicable",
                "secondary_departments": [],
                "confidence": max(result.get("confidence", 0), 0.95),
                "validity_confidence": max(result.get("validity_confidence", 0), 0.95),
                "department_confidence": 0.0,
                "message": "This appears to be a private household or personal service issue, not a government grievance.",
            }
        )
        return result

    departments = set(result.get("departments") or [])
    if "road" in lower and any(term in lower for term in ["pipeline", "drinking water", "water supply"]):
        departments.update(["Water Supply", "Roads & Traffic"])
    if any(term in lower for term in ["sewer", "sewage"]) and any(term in lower for term in ["drinking water", "school", "sick", "children"]):
        departments.update(["Drainage & Flood Control", "Health & Public Hygiene"])
    if any(term in lower for term in ["street light", "street electricity light", "street lighting"]) and any(term in lower for term in ["women", "girls", "unsafe"]):
        departments.update(["Street Lighting", "Women & Child Safety"])
        result["priority"] = "High"
    if any(term in lower for term in ["traffic signal", "signal"]) and any(term in lower for term in ["traffic", "jam", "road"]):
        departments.update(["Roads & Traffic"])
        departments.discard("Electricity")
        if result.get("priority") == "Low":
            result["priority"] = "Medium"
    if any(term in lower for term in ["harassment", "suspicious", "women safety", "following women", "follow women", "stalking", "chasing women"]) and any(term in lower for term in ["women", "girls", "police", "safety", "market"]):
        departments.update(["Public Safety & Police", "Women & Child Safety"])
        departments.discard("Sanitation & Waste")
        departments.discard("Roads & Traffic")
        result["priority"] = "High"
    if any(term in lower for term in ["garbage", "not collected", "kachra"]):
        departments.update(["Sanitation & Waste"])
        departments.discard("Animal Control")
    if any(term in lower for term in ["illegal construction", "encroachment", "unsafe building", "collapse"]):
        departments.update(["Urban Housing & Encroachment"])
        departments.discard("Drainage & Flood Control")
    if "flood water" in lower and any(term in lower for term in ["electric", "spark", "junction box"]):
        departments.update(["Drainage & Flood Control", "Electricity"])
        result["priority"] = "Critical"
    if "garbage" in lower and "road" in lower:
        departments.update(["Sanitation & Waste", "Roads & Traffic"])

    if departments:
        ordered = sorted(
            departments,
            key=lambda name: [
                "Water Supply",
                "Drainage & Flood Control",
                "Electricity",
                "Street Lighting",
                "Sanitation & Waste",
                "Roads & Traffic",
                "Public Safety & Police",
                "Health & Public Hygiene",
                "Women & Child Safety",
                "Urban Housing & Encroachment",
            ].index(name)
            if name in [
                "Water Supply",
                "Drainage & Flood Control",
                "Electricity",
                "Street Lighting",
                "Sanitation & Waste",
                "Roads & Traffic",
                "Public Safety & Police",
                "Health & Public Hygiene",
                "Women & Child Safety",
                "Urban Housing & Encroachment",
            ]
            else 99,
        )
        result["departments"] = ordered
        result["department"] = ordered[0]
        result["primary_department"] = ordered[0]
        result["secondary_departments"] = ordered[1:]
        result["confidence"] = max(result.get("confidence", 0), 0.88)
        result["department_confidence"] = max(result.get("department_confidence", 0), 0.88)

    result["departments"] = [DEPARTMENT_NAME_MAP.get(name, name) for name in result.get("departments", [])]
    result["department"] = DEPARTMENT_NAME_MAP.get(result.get("department"), result.get("department"))
    result["primary_department"] = DEPARTMENT_NAME_MAP.get(result.get("primary_department"), result.get("primary_department"))
    result["secondary_departments"] = [
        DEPARTMENT_NAME_MAP.get(name, name)
        for name in result.get("secondary_departments", [])
    ]
    return result


def predict_department(text, declared_language=""):

    preprocessing = preprocess_runtime_text(text, declared_language)
    classifier_text = preprocessing["classifier_text"]

    if pipeline_ready:
        result = predict_with_pipeline(classifier_text)
        result.update(preprocessing)
        return result

    return {
        "is_valid_grievance": False,
        "authenticity": "Unavailable",
        "department": "Manual Review",
        "departments": ["Manual Review"],
        "primary_department": "Manual Review",
        "secondary_departments": [],
        "priority": detect_priority(classifier_text),
        "sentiment": detect_sentiment(classifier_text),
        "summary": generate_summary(classifier_text),
        "confidence": 0.0,
        "validity_confidence": 0.0,
        "department_confidence": 0.0,
        "message": "New AI pipeline models are not fully loaded. Send to manual review.",
        **preprocessing,
    }

# =========================================
# PREDICT ENDPOINT
# =========================================

@app.post("/predict")

def predict(request: ComplaintRequest):

    # =====================================
    # ORIGINAL INPUT
    # =====================================

    raw_text = request.text

    # =====================================
    # PII REDACTION
    # =====================================

    cleaned_text = redact_pii(
        raw_text
    )

    # =====================================
    # RUN AI PIPELINE
    # =====================================

    result = predict_department(
        cleaned_text,
        declared_language=request.language,
    )

    # =====================================
    # FINAL SECURE RESPONSE
    # =====================================

    return {

        "complaint": cleaned_text,

        "prediction": result
    }


@app.post("/predict-batch")
def predict_batch(request: BatchComplaintRequest):
    results = []
    for text in request.texts:
        cleaned_text = redact_pii(text)
        results.append(
            {
                "complaint": cleaned_text,
                "prediction": predict_department(
                    cleaned_text,
                    declared_language=request.language,
                ),
            }
        )
    return {"count": len(results), "results": results}


def get_whisper_model():
    global _whisper_model
    if _whisper_model:
        return _whisper_model
    from faster_whisper import WhisperModel

    compute_type = "float16" if torch.cuda.is_available() else "int8"
    device_name = "cuda" if torch.cuda.is_available() else "cpu"
    _whisper_model = WhisperModel(
        WHISPER_MODEL_SIZE,
        device=device_name,
        compute_type=compute_type,
    )
    return _whisper_model


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    suffix = Path(audio.filename or "voice.webm").suffix or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(await audio.read())
        temp_path = temp_file.name

    try:
        whisper = get_whisper_model()
        segments, info = whisper.transcribe(temp_path, beam_size=5)
        text = " ".join(segment.text.strip() for segment in segments).strip()
        return {
            "text": text,
            "language": info.language,
            "language_probability": round(info.language_probability or 0.0, 4),
            "model": WHISPER_MODEL_SIZE,
        }
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass
