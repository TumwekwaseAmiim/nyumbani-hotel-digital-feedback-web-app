
"""
Starter TensorFlow/Keras sentiment model for Nyumbani Hotel feedback.
Uses the same data/training_feedback.csv file as the PyTorch trainer.
"""

from pathlib import Path
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from tensorflow import keras
from tensorflow.keras import layers

DATA = Path(__file__).resolve().parents[1] / "data" / "training_feedback.csv"
MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_DIR.mkdir(exist_ok=True)

def main():
    if not DATA.exists():
        raise SystemExit(f"Training file missing: {DATA}")

    df = pd.read_csv(DATA).dropna(subset=["text","label"])
    if len(df) < 12:
        raise SystemExit("Add more labelled examples before training. At least 12 is required for this demo.")

    vectorizer = TfidfVectorizer(max_features=1500, ngram_range=(1,2))
    X = vectorizer.fit_transform(df["text"]).toarray().astype("float32")

    encoder = LabelEncoder()
    y = encoder.fit_transform(df["label"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model = keras.Sequential([
        layers.Input(shape=(X.shape[1],)),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.25),
        layers.Dense(len(encoder.classes_), activation="softmax")
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(X_train, y_train, epochs=35, batch_size=16, validation_split=0.2, verbose=1)

    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"TensorFlow test accuracy: {acc:.3f}")

    model.save(MODEL_DIR/"tensorflow_sentiment.keras")
    joblib.dump(vectorizer, MODEL_DIR/"tensorflow_vectorizer.joblib")
    joblib.dump(encoder, MODEL_DIR/"tensorflow_labels.joblib")
    print("Saved TensorFlow model to /models")

if __name__ == "__main__":
    main()
