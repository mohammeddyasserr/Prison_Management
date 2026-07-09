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

education_weights = [0.10,0.08,0.18,0.18,0.28,0.14,0.04]

prison_types = [
    "Maximum Security",
    "Minimum Security",
    "Remand",
    "Juvenile",
    "Women's"
]

gender_choices = ["Male","Female"]

rows = []

for _ in range(N):

    age = random.randint(18,65)

    prison_type = random.choices(
        prison_types,
        weights=[0.28,0.20,0.25,0.12,0.15]
    )[0]

    gender = "Female" if prison_type=="Women's" else random.choices(
        gender_choices,
        weights=[0.85,0.15]
    )[0]

    education = random.choices(
        education_levels,
        weights=education_weights
    )[0]

    # Prison Security
    if prison_type=="Maximum Security":
        prison_security="High"
    elif prison_type=="Minimum Security":
        prison_security="Low"
    elif prison_type=="Juvenile":
        prison_security=random.choices(
            ["Medium","Low"],
            weights=[0.7,0.3]
        )[0]
    else:
        prison_security=random.choices(
            ["High","Medium","Low"],
            weights=[0.35,0.5,0.15]
        )[0]

    # Block Security
    if prison_security=="High":
        block_security=random.choices(
            ["High","Medium"],
            weights=[0.8,0.2]
        )[0]
    elif prison_security=="Medium":
        block_security=random.choices(
            ["High","Medium","Low"],
            weights=[0.2,0.6,0.2]
        )[0]
    else:
        block_security=random.choices(
            ["Medium","Low"],
            weights=[0.3,0.7]
        )[0]

    # Incident generation
    if prison_security=="High":
        incidents=np.random.poisson(8)
    elif prison_security=="Medium":
        incidents=np.random.poisson(5)
    else:
        incidents=np.random.poisson(2)

    incidents=max(incidents,1)

    violent=np.random.randint(
        0,
        max(1,int(incidents*0.5))
    )

    escape=np.random.randint(
        0,
        max(1,int(incidents*0.4))
    )

    while violent+escape >= incidents:
        if violent>0:
            violent-=1
        elif escape>0:
            escape-=1

    days_since_last=random.randint(0,365)

    disciplinary_days=max(
        0,
        int(np.random.normal(incidents*3,5))
    )

    # ------------------------
    # Risk Score
    # ------------------------

    score=0

    education_score={
        "Illiterate":4,
        "Literate":3,
        "Primary":3,
        "Preparatory":2,
        "Secondary":1,
        "Bachelor's":0,
        "Postgraduate education":-1
    }

    score += education_score[education]

    score += incidents*0.5
    score += violent*2.2
    score += escape*3
    score += disciplinary_days*0.12

    if days_since_last < 30:
        score += 5
    elif days_since_last < 90:
        score += 3
    elif days_since_last < 180:
        score += 1

    if prison_security=="High":
        score += 2
    elif prison_security=="Medium":
        score += 1

    if block_security=="High":
        score += 1

    if score >= 18:
        risk="High"
    elif score >= 9:
        risk="Medium"
    else:
        risk="Low"

    rows.append([
        age,
        gender,
        education,
        prison_type,
        prison_security,
        block_security,
        incidents,
        violent,
        escape,
        days_since_last,
        disciplinary_days,
        risk
    ])

columns=[
    "Age",
    "Gender",
    "education_level",
    "Prison_type",
    "Prison_security_level",
    "Block_security_level",
    "Incidents_count",
    "Violent_incident_count",
    "escape_incident_count",
    "days_since_last_incidence",
    "total_disciplinary_days",
    "Risk Behaviour"
]

df=pd.DataFrame(rows,columns=columns)

# Safety check
assert all(
    df["Incidents_count"] >
    df["Violent_incident_count"] +
    df["escape_incident_count"]
)

# Define output path relative to script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.abspath(os.path.join(script_dir, "..", "datasets"))
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "risk_behavior.csv")

df.to_csv(output_path, index=False)

print(df.head())
print(df["Risk Behaviour"].value_counts())

print(f"\nDataset saved as {output_path}")