import os
import random
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

N = 20000

education_levels = [
    "Illiterate",
    "Literate",
    "Primary",
    "Preparatory",
    "Secondary",
    "Bachelor's",
    "Postgraduate education"
]

education_weights = [
    0.10,
    0.08,
    0.18,
    0.18,
    0.28,
    0.14,
    0.04
]

sentence_types = [
    "Theft",
    "Burglary",
    "Robbery",
    "Fraud",
    "Assault",
    "Murder",
    "Drug Offense",
    "Sexual Offense",
    "Kidnapping",
    "Arson",
    "Vandalism",
    "Cybercrime",
    "Weapons Offense",
    "Public Order"
]

sentence_weights = [
    0.16,
    0.10,
    0.08,
    0.08,
    0.12,
    0.05,
    0.10,
    0.04,
    0.02,
    0.03,
    0.08,
    0.04,
    0.05,
    0.05
]

crime_base_risk = {
    "Theft": 8,
    "Burglary": 12,
    "Robbery": 18,
    "Fraud": 10,
    "Assault": 20,
    "Murder": 28,
    "Drug Offense": 16,
    "Sexual Offense": 26,
    "Kidnapping": 25,
    "Arson": 18,
    "Vandalism": 8,
    "Cybercrime": 9,
    "Weapons Offense": 19,
    "Public Order": 6
}

education_penalty = {
    "Illiterate": 14,
    "Literate": 11,
    "Primary": 9,
    "Preparatory": 6,
    "Secondary": 3,
    "Bachelor's": 0,
    "Postgraduate education": -4
}

gender_choices = ["Male", "Female"]

rows = []

for _ in range(N):

    age = random.randint(18, 65)

    gender = random.choices(
        gender_choices,
        weights=[0.87, 0.13]
    )[0]

    sentence = random.choices(
        sentence_types,
        weights=sentence_weights
    )[0]

    education = random.choices(
        education_levels,
        weights=education_weights
    )[0]

    # -----------------------------
    # Sentence Duration (months)
    # -----------------------------
    if sentence == "Murder":
        duration = random.randint(180, 480)

    elif sentence == "Kidnapping":
        duration = random.randint(120, 300)

    elif sentence == "Sexual Offense":
        duration = random.randint(96, 240)

    elif sentence == "Robbery":
        duration = random.randint(36, 144)

    elif sentence == "Assault":
        duration = random.randint(24, 120)

    elif sentence == "Weapons Offense":
        duration = random.randint(24, 96)

    elif sentence == "Drug Offense":
        duration = random.randint(12, 96)

    elif sentence == "Arson":
        duration = random.randint(36, 120)

    elif sentence == "Burglary":
        duration = random.randint(12, 72)

    elif sentence == "Fraud":
        duration = random.randint(12, 84)

    elif sentence == "Cybercrime":
        duration = random.randint(6, 60)

    elif sentence == "Vandalism":
        duration = random.randint(3, 36)

    elif sentence == "Public Order":
        duration = random.randint(1, 24)

    else:  # Theft
        duration = random.randint(3, 48)

    # -----------------------------
    # Incident Generation
    # -----------------------------
    incidents = np.random.poisson(10)
    incidents = max(incidents, 1)

    violent = np.random.randint(
        0,
        max(1, int(incidents * 0.5))
    )

    escape = np.random.randint(
        0,
        max(1, int(incidents * 0.4))
    )

    while violent + escape >= incidents:
        if violent > 0:
            violent -= 1
        elif escape > 0:
            escape -= 1

    # -----------------------------
    # Recidivism Score (0-100)
    # -----------------------------
    score = 0

    # Crime type effect
    score += crime_base_risk[sentence]

    # Education effect
    score += education_penalty[education]

    # Age effect
    if age < 25:
        score += 10
    elif age < 35:
        score += 6
    elif age < 50:
        score += 2
    else:
        score -= 2

    # Sentence duration
    score += duration * 0.035

    # Prison behavior
    score += incidents * 1.5
    score += violent * 3
    score += escape * 6

    # Random noise
    score += np.random.normal(0, 4)

    score = round(np.clip(score, 0, 100), 1)

    rows.append([
        age,
        gender,
        sentence,
        education,
        duration,
        incidents,
        violent,
        escape,
        score
    ])

columns = [
    "Age",
    "Gender",
    "Sentence Type",
    "education_level",
    "Sentence_duration_months",
    "Incident_count",
    "violent_incidents_count",
    "escape_incidents_count",
    "Recidivism_score"
]

df = pd.DataFrame(rows, columns=columns)

# Safety Check
assert all(
    df["Incident_count"] >
    df["violent_incidents_count"] +
    df["escape_incidents_count"]
)

# Save Dataset
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.abspath(os.path.join(script_dir, "..", "datasets"))
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(
    output_dir,
    "recidivism_score.csv"
)

df.to_csv(output_path, index=False)

print(df.head())
print(df["Recidivism_score"].describe())

print(f"\nDataset saved as {output_path}")