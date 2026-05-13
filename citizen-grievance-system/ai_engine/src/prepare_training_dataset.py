from pathlib import Path
import sys

import pandas as pd

AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

from src.text_preprocessing import prepare_classifier_text


RAW_DATASET = AI_ENGINE_DIR / "data" / "raw" / "enterprise_governance_v5_cleaned_enhanced.csv"
PROCESSED_DIR = AI_ENGINE_DIR / "data" / "processed"
TARGET_DATASET = PROCESSED_DIR / "enterprise_governance_pipeline_ready.csv"


def build_pipeline_dataset():
    if not RAW_DATASET.exists():
        raise FileNotFoundError(f"Raw enhanced dataset not found: {RAW_DATASET}")

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(RAW_DATASET, encoding="utf-8")

    translated_rows = df.apply(prepare_classifier_text, axis=1, result_type="expand")
    translated_rows.columns = ["translated_text", "detected_language", "classifier_text"]
    df["detected_language"] = translated_rows["detected_language"]
    df["translated_text"] = translated_rows["translated_text"]
    df["classifier_text"] = translated_rows["classifier_text"]
    df["model_input_text"] = df["classifier_text"]

    df = df.drop_duplicates(subset=["complaint_text"]).copy()

    df.to_csv(TARGET_DATASET, index=False, encoding="utf-8")

    fake_count = int(df["authenticity_label"].eq("Fake").sum())
    multi_count = int(df["secondary_departments"].replace("None", pd.NA).notna().sum())
    print(f"Saved pipeline-ready dataset: {TARGET_DATASET}")
    print(f"Rows: {len(df)}")
    print(f"Fake complaints: {fake_count} ({fake_count / len(df) * 100:.2f}%)")
    print(f"Multi-department complaints: {multi_count} ({multi_count / len(df) * 100:.2f}%)")
    print(f"Duplicate complaint text: {int(df.duplicated('complaint_text').sum())}")
    print("\nDetected language distribution:")
    print(df["detected_language"].value_counts().to_string())


if __name__ == "__main__":
    build_pipeline_dataset()
