import os
import json
import numpy as np
import pandas as pd
import torch
import evaluate

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

from datasets import Dataset

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)

# =========================================
# GPU CHECK
# =========================================

print("\nChecking GPU...")

if torch.cuda.is_available():

    print("GPU Available!")
    print("GPU Name:", torch.cuda.get_device_name(0))

else:

    print("GPU NOT Available")

# =========================================
# LOAD DATASET
# =========================================

print("\nLoading dataset...")

df = pd.read_csv(
    "data/raw/citizen_grievances_dataset.csv"
)

print("\nDataset Loaded Successfully!")

# =========================================
# KEEP REQUIRED COLUMNS
# =========================================

df = df[
    [
        "complaint_text",
        "department_label"
    ]
]

# =========================================
# REMOVE EMPTY VALUES
# =========================================

df.dropna(inplace=True)

# =========================================
# CLEAN TEXT
# =========================================

df["complaint_text"] = (
    df["complaint_text"]
    .astype(str)
    .str.strip()
)

# =========================================
# LABEL ENCODING
# =========================================

print("\nEncoding labels...")

label_encoder = LabelEncoder()

df["label"] = label_encoder.fit_transform(
    df["department_label"]
)

# =========================================
# LABEL MAPPING
# =========================================

label_mapping = dict(
    zip(
        label_encoder.classes_,
        label_encoder.transform(label_encoder.classes_)
    )
)

print("\nLabel Mapping:")

for key, value in label_mapping.items():
    print(f"{key} --> {value}")

# =========================================
# TRAIN TEST SPLIT
# =========================================

print("\nSplitting dataset...")

train_texts, test_texts, train_labels, test_labels = train_test_split(
    df["complaint_text"],
    df["label"],
    test_size=0.2,
    random_state=42
)

print("\nTraining Samples:", len(train_texts))
print("Testing Samples:", len(test_texts))

# =========================================
# CREATE HUGGINGFACE DATASETS
# =========================================

print("\nCreating HuggingFace datasets...")

train_dataset = Dataset.from_dict({
    "text": train_texts.tolist(),
    "label": train_labels.tolist()
})

test_dataset = Dataset.from_dict({
    "text": test_texts.tolist(),
    "label": test_labels.tolist()
})

# =========================================
# LOAD TOKENIZER
# =========================================

MODEL_NAME = "distilbert-base-multilingual-cased"

print("\nLoading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

# =========================================
# TOKENIZATION FUNCTION
# =========================================

def tokenize_function(example):

    return tokenizer(
        example["text"],
        padding="max_length",
        truncation=True,
        max_length=128
    )

# =========================================
# TOKENIZE DATASETS
# =========================================

print("\nTokenizing datasets...")

train_dataset = train_dataset.map(
    tokenize_function,
    batched=True
)

test_dataset = test_dataset.map(
    tokenize_function,
    batched=True
)

# =========================================
# LOAD MODEL
# =========================================

print("\nLoading multilingual transformer model...")

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(label_mapping)
)

# =========================================
# EVALUATION METRIC
# =========================================

accuracy_metric = evaluate.load("accuracy")

def compute_metrics(eval_pred):

    logits, labels = eval_pred

    predictions = np.argmax(logits, axis=-1)

    return accuracy_metric.compute(
        predictions=predictions,
        references=labels
    )

# =========================================
# TRAINING ARGUMENTS
# =========================================

training_args = TrainingArguments(

    output_dir="results",

    eval_strategy="epoch",

    save_strategy="epoch",

    learning_rate=2e-5,

    per_device_train_batch_size=8,

    per_device_eval_batch_size=8,

    num_train_epochs=3,

    weight_decay=0.01,

    logging_dir="./logs",

    logging_steps=10,

    fp16=torch.cuda.is_available()
)

# =========================================
# TRAINER
# =========================================

trainer = Trainer(

    model=model,

    args=training_args,

    train_dataset=train_dataset,

    eval_dataset=test_dataset,

    compute_metrics=compute_metrics
)

# =========================================
# START TRAINING
# =========================================

print("\nStarting model training...")

trainer.train()

# =========================================
# EVALUATE MODEL
# =========================================

print("\nEvaluating model...")

results = trainer.evaluate()

print("\nEvaluation Results:")
print(results)

# =========================================
# SAVE MODEL
# =========================================

MODEL_SAVE_PATH = "models/grievance_classifier"

print("\nSaving model...")

os.makedirs(MODEL_SAVE_PATH, exist_ok=True)

model.save_pretrained(MODEL_SAVE_PATH)

tokenizer.save_pretrained(MODEL_SAVE_PATH)

# =========================================
# SAVE LABEL MAPPING
# =========================================

print("\nSaving label mappings...")

label_map_path = f"{MODEL_SAVE_PATH}/label_mapping.json"

reverse_mapping = {
    str(value): key
    for key, value in label_mapping.items()
}

with open(label_map_path, "w") as f:

    json.dump(reverse_mapping, f, indent=4)

print(f"Label mapping saved at: {label_map_path}")

# =========================================
# COMPLETE
# =========================================

print("\nTraining Complete!")

print(f"\nModel saved at: {MODEL_SAVE_PATH}")