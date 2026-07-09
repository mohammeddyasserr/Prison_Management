import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

from sklearn.metrics import accuracy_score, f1_score


# ─────────────────────────────────────────────────────────────
# STEP 1 ── Custom Feature Engineering Transformer
# Fits inside the Pipeline like any other sklearn step
# ─────────────────────────────────────────────────────────────

class LoanFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Adds domain-specific features before preprocessing.
    Works on raw (unscaled, un-encoded) DataFrames.
    """

    def fit(self, X, y=None):
        return self  # nothing to learn

    def transform(self, X):
        X = X.copy()

        X['TotalIncome']          = X['ApplicantIncome'] + X['CoapplicantIncome']
        X['LoanAmount_log']       = np.log1p(X['LoanAmount'])
        X['TotalIncome_log']      = np.log1p(X['TotalIncome'])
        X['ApplicantIncome_log']  = np.log1p(X['ApplicantIncome'])
        X['CoapplicantIncome_log']= np.log1p(X['CoapplicantIncome'])
        X['Income_to_Loan_Ratio'] = X['TotalIncome'] / X['LoanAmount']
        X['EMI']                  = X['LoanAmount'] / X['Loan_Amount_Term']
        X['EMI_to_Income_Ratio']  = X['EMI'] / X['TotalIncome']

        # Drop raw columns that have been replaced by log versions
        X = X.drop(columns=['ApplicantIncome', 'CoapplicantIncome',
                             'LoanAmount', 'TotalIncome', 'EMI'], errors='ignore')
        return X


# ─────────────────────────────────────────────────────────────
# STEP 2 ── Column definitions (after feature engineering)
# ─────────────────────────────────────────────────────────────

CATEGORICAL_FEATURES = [
    'Gender', 'Married', 'Dependents', 'Education',
    'Self_Employed', 'Property_Area'
]

NUMERICAL_FEATURES = [
    'LoanAmount_log', 'TotalIncome_log', 'ApplicantIncome_log',
    'CoapplicantIncome_log', 'Loan_Amount_Term', 'Credit_History',
    'Income_to_Loan_Ratio', 'EMI_to_Income_Ratio'
]


# ─────────────────────────────────────────────────────────────
# STEP 3 ── Preprocessing sub-pipelines
# ─────────────────────────────────────────────────────────────

numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer,  NUMERICAL_FEATURES),
    ('cat', categorical_transformer, CATEGORICAL_FEATURES)
])


# ─────────────────────────────────────────────────────────────
# STEP 4 ── Model definitions
# ─────────────────────────────────────────────────────────────

MODELS = {
    'Logistic Regression':  LogisticRegression(random_state=42, max_iter=1000),
    'Decision Tree':        DecisionTreeClassifier(random_state=42),
    'Random Forest':        RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting':    GradientBoostingClassifier(n_estimators=100, random_state=42),
    'Naive Bayes':          GaussianNB(),
    'SVM':                  SVC(probability=True, random_state=42),
    'K-Nearest Neighbors':  KNeighborsClassifier(n_neighbors=5)
}


# ─────────────────────────────────────────────────────────────
# STEP 5 ── Build one full Pipeline per model
# ─────────────────────────────────────────────────────────────

def build_pipeline(classifier):
    """
    Returns a complete end-to-end sklearn Pipeline:
      raw CSV data ──► feature engineering ──► impute/scale/encode ──► model
    """
    return Pipeline([
        ('feature_engineer', LoanFeatureEngineer()),
        ('preprocessor',     preprocessor),
        ('classifier',       classifier)
    ])


# ─────────────────────────────────────────────────────────────
# STEP 6 ── Train & evaluate all models
# ─────────────────────────────────────────────────────────────

def train_and_evaluate(X, y, test_size=0.2):
    """
    Trains every model pipeline, evaluates on the test split,
    and returns a results dict + the best pipeline object.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    le = LabelEncoder()
    y_train_enc = le.fit_transform(y_train)
    y_test_enc  = le.transform(y_test)

    results = {}

    for name, model in MODELS.items():
        print(f"\n⏳ Training {name}...")

        pipeline = build_pipeline(model)
        pipeline.fit(X_train, y_train_enc)

        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test_enc, y_pred)
        f1  = f1_score(y_test_enc, y_pred)

        results[name] = {
            'pipeline':     pipeline,
            'accuracy':     acc,
            'f1_score':     f1,
            'predictions':  y_pred,
        }

        print(f"   Accuracy : {acc:.4f}")
        print(f"   F1-Score : {f1:.4f}")

    best_name = max(results, key=lambda n: results[n]['f1_score'])
    print(f"\n🏆 BEST MODEL : {best_name}")
    print(f"   F1-Score : {results[best_name]['f1_score']:.4f}")
    print(f"   Accuracy : {results[best_name]['accuracy']:.4f}")

    return results, best_name, y_test_enc, le


# ─────────────────────────────────────────────────────────────
# STEP 7 ── Entry point
# ─────────────────────────────────────────────────────────────

if __name__ == '__main__':

    # ── Load raw data (no manual preprocessing needed) ──
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(BASE_DIR, 'loan_dataset.csv')
    df = pd.read_csv(csv_path)

    # Keep only the original input columns; the Pipeline handles the rest
    INPUT_COLS = [
        'Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
        'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount',
        'Loan_Amount_Term', 'Credit_History', 'Property_Area'
    ]

    X = df[INPUT_COLS]
    y = df['Loan_Status']

    # ── Train ──
    results, best_name, y_test_enc, le = train_and_evaluate(X, y)

    # ── Save the best pipeline (feature engineering + preprocessing + model) ──
    best_pipeline = results[best_name]['pipeline']
    
    MODELS_DIR = os.path.join(os.path.dirname(BASE_DIR), 'models')
    os.makedirs(MODELS_DIR, exist_ok=True)
    pkl_path = os.path.join(MODELS_DIR, 'model.pkl')
    
    joblib.dump(best_pipeline, pkl_path)
    print(f"\n✅ Best pipeline saved as '{pkl_path}'")

    # # ── Predict on new RAW data (no manual preprocessing needed) ──
    # new_data = pd.DataFrame({
    #     'Gender':            ['Male', 'Female'],
    #     'Married':           ['Yes', 'No'],
    #     'Dependents':        ['0', '2'],
    #     'Education':         ['Graduate', 'Not Graduate'],
    #     'Self_Employed':     ['No', 'Yes'],
    #     'ApplicantIncome':   [5000, 3000],
    #     'CoapplicantIncome': [1500, 0],
    #     'LoanAmount':        [120, 80],
    #     'Loan_Amount_Term':  [360, 180],
    #     'Credit_History':    [1.0, np.nan],
    #     'Property_Area':     ['Urban', 'Rural']
    # })

    # loaded_pipeline = joblib.load(pkl_path)
    # preds = loaded_pipeline.predict(new_data)
    # print("\n🔮 Predictions on new data:", le.inverse_transform(preds))
