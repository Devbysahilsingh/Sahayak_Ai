import json
import torch

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
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
# LOAD MODEL
# =========================================

print("Loading trained model...")

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
# GPU SUPPORT
# =========================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

model.to(device)

model.eval()

print(f"\nUsing Device: {device}")

# =========================================
# PREDICTION FUNCTION
# =========================================

def predict_department(text):

    # Tokenize input

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    # Move tensors to GPU

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    # Disable gradient calculation

    with torch.no_grad():

        outputs = model(**inputs)

    # Get probabilities

    probabilities = torch.nn.functional.softmax(
        outputs.logits,
        dim=-1
    )

    # Predicted class

    predicted_class = torch.argmax(
        probabilities,
        dim=1
    ).item()

    confidence = torch.max(
        probabilities
    ).item()

    # Convert label to department

    department = label_mapping[
        str(predicted_class)
    ]

    return {
        "department": department,
        "confidence": round(confidence, 4)
    }

# =========================================
# INTERACTIVE LOOP
# =========================================

print("\nAI Grievance Classifier Ready!")
print("Type your complaint below.")
print("Type 'exit' to quit.\n")

while True:

    complaint = input("Enter Complaint: ")

    if complaint.lower() == "exit":

        print("\nExiting AI Classifier...")
        break

    result = predict_department(
        complaint
    )

    print("\nPrediction Result:")

    print(f"Department : {result['department']}")

    print(f"Confidence : {result['confidence']}")

    print("-" * 60)