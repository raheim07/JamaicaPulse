import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils import resample
import joblib

os.makedirs(r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model\model", exist_ok=True)

#Load labeled CSV
df = pd.read_csv(r"NationPulse/pulseofthenation.github.io/ML_model/data/jamaica_posts_labeled.csv")
print("Loaded", len(df), "rows")


#Clean data
df = df.dropna(subset=["text", "category"]).reset_index(drop=True)
df["text"] = df["text"].astype(str).str.strip()
print("Loaded", len(df), "rows")

#Rebalance classess (upsample minorirty classes)
max_count = df["category"].value_counts().max()
balanced = []
for cat, group in df.groupby("category"):
    if len(group) < max_count:
        up = resample(group, replace=True, n_samples=max_count, random_state=42)
        balanced.append(up)
    else:
        balanced.append(group)
df_bal = pd.concat(balanced).sample(frac=1, random_state=42).reset_index(drop=True)
print("After balancing:", df_bal["category"].value_counts().to_dict())

#Vectorize
vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1,2), max_features=5000)
X = vectorizer.fit_transform(df_bal["text"])
y = df_bal["category"]


#Train/Validation split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

# Choose model Logistic Regression
model = LogisticRegression(max_iter=2000, solver="liblinear", multi_class="ovr", random_state=42)
# model = RandomForestClassifier(n_estimators=200, random_state=42)

model.fit(X_train, y_train)


#Evaluate
y_pred = model.predict(X_test)
print("\nClassification Report: \n")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))


#save model and vectorizer
joblib.dump(vectorizer, r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model/model/vectorizer.pkl")
joblib.dump(model, r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model/model/model.pkl")
print("\nSaved model/vectorizer to model/ directory")