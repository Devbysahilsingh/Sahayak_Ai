import json
import os
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from datasets import Dataset
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = BASE_DIR / "data" / "processed" / "enterprise_governance_pipeline_ready.csv"
DATASET_PATH = Path(os.getenv("GRIEVANCE_DATASET_PATH", DEFAULT_DATASET))
MODEL_NAME = os.getenv("GRIEVANCE_BASE_MODEL", "distilbert-base-multilingual-cased")
OUTPUT_DIR = BASE_DIR / "models" / "grievance_pipeline"
MAX_LENGTH = int(os.getenv("GRIEVANCE_MAX_LENGTH", "160"))
EPOCHS = float(os.getenv("GRIEVANCE_EPOCHS", "3"))
BATCH_SIZE = int(os.getenv("GRIEVANCE_BATCH_SIZE", "8"))
TRAIN_TASKS = {
    task.strip().lower()
    for task in os.getenv("GRIEVANCE_TRAIN_TASKS", "validity,department,priority").split(",")
    if task.strip()
}


def clean_text(value):
    return " ".join(str(value).strip().split())


def load_dataset():
    print(f"\nLoading dataset: {DATASET_PATH}")
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH, encoding="utf-8")
    required = [
        "classifier_text",
        "is_valid_grievance",
        "department_labels",
        "priority_level",
    ]
    missing = [column for column in required if column not in df.columns]
    if missing:
        raise ValueError(f"Dataset missing columns: {missing}")

    df = df.dropna(subset=required).copy()
    input_column = "classifier_text" if "classifier_text" in df.columns else "model_input_text"
    df["text"] = df[input_column].map(clean_text)
    df = df[df["text"].str.len() > 0].copy()
    df["is_valid_grievance"] = df["is_valid_grievance"].astype(int)
    df["department_labels"] = df["department_labels"].astype(str)
    df["priority_level"] = df["priority_level"].astype(str)
    print(f"Rows ready for training: {len(df)}")
    return df


def tokenize_dataset(dataset, tokenizer):
    def tokenize(batch):
        return tokenizer(
            batch["text"],
            truncation=True,
            padding="max_length",
            max_length=MAX_LENGTH,
        )

    return dataset.map(tokenize, batched=True)


def build_training_args(output_dir):
    return TrainingArguments(
        output_dir=str(output_dir / "checkpoints"),
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=EPOCHS,
        weight_decay=0.01,
        logging_dir=str(output_dir / "logs"),
        logging_steps=25,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        fp16=torch.cuda.is_available(),
        report_to=[],
    )


def save_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2, ensure_ascii=False)


def latest_checkpoint(output_dir):
    checkpoint_root = output_dir / "checkpoints"
    if not checkpoint_root.exists():
        return None
    checkpoints = [
        path
        for path in checkpoint_root.iterdir()
        if path.is_dir() and path.name.startswith("checkpoint-")
    ]
    if not checkpoints:
        return None
    return str(max(checkpoints, key=lambda path: int(path.name.split("-")[-1])))


def train_validity_model(df, tokenizer):
    print("\nTraining validity classifier...")
    train_df, eval_df = train_test_split(
        df[["text", "is_valid_grievance"]],
        test_size=0.2,
        random_state=42,
        stratify=df["is_valid_grievance"],
    )
    train_ds = Dataset.from_pandas(train_df.rename(columns={"is_valid_grievance": "label"}), preserve_index=False)
    eval_ds = Dataset.from_pandas(eval_df.rename(columns={"is_valid_grievance": "label"}), preserve_index=False)
    train_ds = tokenize_dataset(train_ds, tokenizer)
    eval_ds = tokenize_dataset(eval_ds, tokenizer)

    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        return {
            "accuracy": accuracy_score(labels, predictions),
            "f1": f1_score(labels, predictions, average="binary"),
        }

    output_dir = OUTPUT_DIR / "validity_model"
    trainer = Trainer(
        model=model,
        args=build_training_args(output_dir),
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        compute_metrics=compute_metrics,
    )
    trainer.train(resume_from_checkpoint=latest_checkpoint(output_dir))
    metrics = trainer.evaluate()
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    save_json(output_dir / "label_mapping.json", {"0": "Invalid", "1": "Genuine"})
    return metrics


def split_department_labels(value):
    labels = [part.strip() for part in str(value).split("|") if part.strip()]
    return labels or ["Not Applicable"]


def train_department_model(df, tokenizer):
    print("\nTraining multi-department classifier...")
    work_df = df[["text", "department_labels", "is_valid_grievance"]].copy()
    work_df["labels_list"] = work_df["department_labels"].map(split_department_labels)

    mlb = MultiLabelBinarizer()
    label_matrix = mlb.fit_transform(work_df["labels_list"]).astype(np.float32)
    label_columns = [f"label_{index}" for index in range(label_matrix.shape[1])]
    label_df = pd.DataFrame(label_matrix, columns=label_columns)
    model_df = pd.concat([work_df[["text", "is_valid_grievance"]].reset_index(drop=True), label_df], axis=1)

    stratify_label = work_df["is_valid_grievance"]
    train_df, eval_df = train_test_split(
        model_df,
        test_size=0.2,
        random_state=42,
        stratify=stratify_label,
    )

    def to_dataset(frame):
        dataset = Dataset.from_dict(
            {
                "text": frame["text"].tolist(),
                "labels": frame[label_columns].astype(np.float32).values.tolist(),
            }
        )
        return tokenize_dataset(dataset, tokenizer)

    train_ds = to_dataset(train_df)
    eval_ds = to_dataset(eval_df)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(mlb.classes_),
        problem_type="multi_label_classification",
    )

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        probabilities = 1 / (1 + np.exp(-logits))
        predictions = (probabilities >= 0.5).astype(int)
        return {
            "f1": f1_score(labels, predictions, average="micro", zero_division=0),
            "macro_f1": f1_score(labels, predictions, average="macro", zero_division=0),
        }

    output_dir = OUTPUT_DIR / "department_model"
    trainer = Trainer(
        model=model,
        args=build_training_args(output_dir),
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        compute_metrics=compute_metrics,
    )
    trainer.train(resume_from_checkpoint=latest_checkpoint(output_dir))
    metrics = trainer.evaluate()
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    save_json(output_dir / "label_mapping.json", {str(i): label for i, label in enumerate(mlb.classes_)})
    return metrics


def train_priority_model(df, tokenizer):
    print("\nTraining priority classifier...")
    encoder = LabelEncoder()
    work_df = df[["text", "priority_level"]].copy()
    work_df["label"] = encoder.fit_transform(work_df["priority_level"])
    train_df, eval_df = train_test_split(
        work_df[["text", "label"]],
        test_size=0.2,
        random_state=42,
        stratify=work_df["label"],
    )
    train_ds = Dataset.from_pandas(train_df, preserve_index=False)
    eval_ds = Dataset.from_pandas(eval_df, preserve_index=False)
    train_ds = tokenize_dataset(train_ds, tokenizer)
    eval_ds = tokenize_dataset(eval_ds, tokenizer)

    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=len(encoder.classes_))

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        return {
            "accuracy": accuracy_score(labels, predictions),
            "f1": f1_score(labels, predictions, average="macro"),
        }

    output_dir = OUTPUT_DIR / "priority_model"
    trainer = Trainer(
        model=model,
        args=build_training_args(output_dir),
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        compute_metrics=compute_metrics,
    )
    trainer.train(resume_from_checkpoint=latest_checkpoint(output_dir))
    metrics = trainer.evaluate()
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    save_json(output_dir / "label_mapping.json", {str(i): label for i, label in enumerate(encoder.classes_)})
    return metrics


def main():
    print("\nChecking GPU...")
    if torch.cuda.is_available():
        print("GPU Available:", torch.cuda.get_device_name(0))
    else:
        print("GPU NOT Available. Training will be slower.")

    df = load_dataset()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    metrics = {
        "base_model": MODEL_NAME,
        "dataset": str(DATASET_PATH),
        "rows": len(df),
    }
    if "validity" in TRAIN_TASKS:
        metrics["validity_model"] = train_validity_model(df, tokenizer)
    if "department" in TRAIN_TASKS:
        metrics["department_model"] = train_department_model(df, tokenizer)
    if "priority" in TRAIN_TASKS:
        metrics["priority_model"] = train_priority_model(df, tokenizer)
    save_json(OUTPUT_DIR / "training_metrics.json", metrics)
    print("\nTraining complete.")
    print(f"Saved pipeline at: {OUTPUT_DIR}")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
