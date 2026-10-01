
"""
Starter PyTorch neural-network trainer for Nyumbani Hotel feedback sentiment.

Expected CSV:
text,label
"The food was excellent",positive
"The wifi was terrible",negative
"It was okay",neutral
"""

from pathlib import Path
import json
import pandas as pd
import torch
import torch.nn as nn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

DATA = Path(__file__).resolve().parents[1] / "data" / "training_feedback.csv"
MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_DIR.mkdir(exist_ok=True)

class SentimentNet(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(hidden_dim, output_dim)
        )

    def forward(self, x):
        return self.net(x)

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

    X_train = torch.tensor(X_train)
    y_train = torch.tensor(y_train, dtype=torch.long)
    X_test_t = torch.tensor(X_test)

    model = SentimentNet(X.shape[1], 128, len(encoder.classes_))
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()

    model.train()
    for epoch in range(80):
        optimizer.zero_grad()
        logits = model(X_train)
        loss = criterion(logits, y_train)
        loss.backward()
        optimizer.step()

    model.eval()
    with torch.no_grad():
        preds = model(X_test_t).argmax(dim=1).numpy()

    print(classification_report(y_test, preds, target_names=encoder.classes_))

    torch.save({
        "state_dict": model.state_dict(),
        "input_dim": X.shape[1],
        "hidden_dim": 128,
        "output_dim": len(encoder.classes_)
    }, MODEL_DIR/"pytorch_sentiment.pt")
    joblib.dump(vectorizer, MODEL_DIR/"pytorch_vectorizer.joblib")
    joblib.dump(encoder, MODEL_DIR/"pytorch_labels.joblib")
    print("Saved PyTorch model to /models")

if __name__ == "__main__":
    main()
