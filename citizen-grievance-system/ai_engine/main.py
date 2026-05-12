import json
import torch

from fastapi import FastAPI
from pydantic import BaseModel

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

MODEL_PATH = "models/grievance_classifier"

# =========================================
# LOAD TOKENIZER
# =========================================

print("\nLoading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH
)

# =========================================
# LOAD CLASSIFICATION MODEL
# =========================================

print("Loading trained classification model...")

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH
)

# =========================================
# LOAD LABEL MAPPING
# =========================================

print("Loading label mappings...")

with open(f"{MODEL_PATH}/label_mapping.json", "r") as f:

    label_mapping = json.load(f)

# =========================================
# GPU / CPU SUPPORT
# =========================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

model.to(device)

model.eval()

print(f"\nUsing Device: {device}")

# =========================================
# REQUEST MODEL
# =========================================

class ComplaintRequest(BaseModel):

    text: str

# =========================================
# ROOT ENDPOINT
# =========================================

@app.get("/")

def home():

    return {

        "message": "AI Grievance Intelligence Engine Running",

        "features": [

            "Department Classification",

            "Priority Detection",

            "Sentiment Analysis",

            "PII Redaction",

            "AI Summarization"
        ]
    }

# =========================================
# DEPARTMENT PREDICTION FUNCTION
# =========================================

def predict_department(text):

    # =====================================
    # TOKENIZATION
    # =====================================

    inputs = tokenizer(

        text,

        return_tensors="pt",

        truncation=True,

        padding=True,

        max_length=128
    )

    # =====================================
    # MOVE INPUTS TO DEVICE
    # =====================================

    inputs = {

        key: value.to(device)

        for key, value in inputs.items()
    }

    # =====================================
    # MODEL INFERENCE
    # =====================================

    with torch.no_grad():

        outputs = model(**inputs)

    # =====================================
    # SOFTMAX PROBABILITIES
    # =====================================

    probabilities = torch.nn.functional.softmax(

        outputs.logits,

        dim=-1
    )

    predicted_class = torch.argmax(

        probabilities,

        dim=1
    ).item()

    confidence = torch.max(

        probabilities

    ).item()

    # =====================================
    # LABEL LOOKUP
    # =====================================

    department = label_mapping[
        str(predicted_class)
    ]

    # =====================================
    # PRIORITY DETECTION
    # =====================================

    priority = detect_priority(
        text
    )

    # =====================================
    # SENTIMENT DETECTION
    # =====================================

    sentiment = detect_sentiment(
        text
    )

    # =====================================
    # AI SUMMARY GENERATION
    # =====================================

    summary = generate_summary(
        text
    )

    # =====================================
    # FINAL AI RESPONSE
    # =====================================

    return {

        "department": department,

        "priority": priority,

        "sentiment": sentiment,

        "summary": summary,

        "confidence": round(confidence, 4)
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
        cleaned_text
    )

    # =====================================
    # FINAL SECURE RESPONSE
    # =====================================

    return {

        "complaint": cleaned_text,

        "prediction": result
    }