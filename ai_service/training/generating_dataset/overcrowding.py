import numpy as np
import pandas as pd
import random

np.random.seed(42)
random.seed(42)

N = 20000

prison_types = [
    "Maximum Security",
    "Minimum Security",
    "Remand",
    "Juvenile",
    "Women's"
]

security_levels = ["High", "Medium", "Low"]

rows = []

for i in range(N):

    prison_id = f"P{np.random.randint(1,250):03d}"

    prison_type = random.choice(prison_types)

    # ----------------------------
    # Security level depends on prison type
    # ----------------------------

    if prison_type == "Maximum Security":
        security = np.random.choice(
            ["High", "Medium"],
            p=[0.9,0.1]
        )

    elif prison_type == "Minimum Security":
        security = np.random.choice(
            ["Low","Medium"],
            p=[0.85,0.15]
        )

    else:
        security = np.random.choice(
            security_levels,
            p=[0.25,0.5,0.25]
        )

    # ----------------------------
    # Blocks
    # ----------------------------

    blocks = np.random.randint(1,11)

    # ----------------------------
    # Capacity based on blocks
    # ----------------------------

    capacity = blocks * np.random.randint(80,250)

    # ----------------------------
    # Current Occupancy
    # Always <= Capacity
    # ----------------------------

    occupancy_ratio = np.random.uniform(0.55,0.98)

    current_occ = int(capacity * occupancy_ratio)

    # ----------------------------
    # Admissions
    # ----------------------------

    admissions_30 = np.random.poisson(
        max(current_occ/35,5)
    )

    admissions_7 = np.random.randint(
        max(1, admissions_30//8),
        max(2, admissions_30//3 + 1)
    )

    admissions_7 = min(admissions_7, admissions_30)

    pending_admissions = np.random.poisson(
        admissions_30*0.15
    )

    # ----------------------------
    # Releases
    # ----------------------------

    releases_30 = np.random.poisson(
        max(current_occ/38,4)
    )

    releases_7 = np.random.randint(
        max(1,releases_30//8),
        max(2,releases_30//3 + 1)
    )

    releases_7 = min(releases_7,releases_30)

    # ----------------------------
    # Upcoming Releases
    # cumulative
    # ----------------------------

    up30 = releases_30 + np.random.randint(0,15)

    up60 = up30 + np.random.randint(5,30)

    up90 = up60 + np.random.randint(5,40)

    # ----------------------------
    # Transfers
    # ----------------------------

    transfers_in = np.random.poisson(current_occ/80)

    transfers_out = np.random.poisson(current_occ/85)

    pending_in = np.random.poisson(transfers_in*0.3)

    pending_out = np.random.poisson(transfers_out*0.3)

    # ----------------------------
    # Remaining sentence
    # ----------------------------

    if prison_type == "Juvenile":
        avg_sentence = round(np.random.uniform(0.5,4),2)

    elif prison_type == "Remand":
        avg_sentence = round(np.random.uniform(0.1,1.5),2)

    elif prison_type == "Maximum Security":
        avg_sentence = round(np.random.uniform(8,20),2)

    else:
        avg_sentence = round(np.random.uniform(2,10),2)

    median_sentence = round(
        max(
            0.1,
            avg_sentence + np.random.normal(0,1)
        ),
        2
    )

    # ----------------------------
    # Historical Occupancies
    # ----------------------------

    # Small trend over time
    trend = np.random.randint(-40, 41)

    occ90 = current_occ - trend + np.random.randint(-15, 16)
    occ60 = occ90 + trend // 3 + np.random.randint(-10, 11)
    occ30 = occ60 + trend // 3 + np.random.randint(-10, 11)
    occ7  = occ30 + trend // 3 + np.random.randint(-5, 6)

    # Never allow zero
    occ90 = max(1, min(capacity, occ90))
    occ60 = max(1, min(capacity, occ60))
    occ30 = max(1, min(capacity, occ30))
    occ7  = max(1, min(capacity, occ7))

    # ---------------------------------------------------
    # FUTURE OCCUPANCY PREDICTION TARGETS
    # ---------------------------------------------------

    future30 = (
        current_occ
        + pending_admissions
        + admissions_30
        + transfers_in
        + pending_in
        - up30
        - transfers_out
        - pending_out
    )

    future30 += np.random.randint(-15,16)

    future30 = max(0,min(capacity,future30))

    future60 = (
        future30
        + int(admissions_30*0.8)
        + pending_admissions
        - (up60-up30)
        + np.random.randint(-20,21)
    )

    future60 = max(0,min(capacity,future60))

    future90 = (
        future60
        + int(admissions_30*0.6)
        - (up90-up60)
        + np.random.randint(-25,26)
    )

    future90 = max(0,min(capacity,future90))

    rows.append([

        prison_id,
        prison_type,
        security,
        capacity,
        blocks,

        current_occ,

        admissions_7,
        admissions_30,
        pending_admissions,

        releases_7,
        releases_30,
        up30,
        up60,
        up90,

        transfers_in,
        transfers_out,
        pending_in,
        pending_out,

        avg_sentence,
        median_sentence,

        occ7,
        occ30,
        occ60,
        occ90,

        future30,
        future60,
        future90
    ])

columns = [

    "Prison_ID",
    "Prison_Type",
    "Security_Level",
    "Capacity",
    "Number_of_Blocks",

    "Current_Occupancy",

    "Admissions_Last_7_Days",
    "Admissions_Last_30_Days",
    "Pending_Admissions",

    "Releases_Last_7_Days",
    "Releases_Last_30_Days",
    "Upcoming_Releases_30_Days",
    "Upcoming_Releases_60_Days",
    "Upcoming_Releases_90_Days",

    "Transfers_In_Last_30_Days",
    "Transfers_Out_Last_30_Days",
    "Pending_Transfers_In",
    "Pending_Transfers_Out",

    "Average_Remaining_Sentence",
    "Median_Remaining_Sentence",

    "Occupancy_7_Days_Ago",
    "Occupancy_30_Days_Ago",
    "Occupancy_60_Days_Ago",
    "Occupancy_90_Days_Ago",

    "Occupancy_30_Days",
    "Occupancy_60_Days",
    "Occupancy_90_Days"
]

df = pd.DataFrame(rows, columns=columns)

df.to_csv("overcrowding_prediction_dataset.csv", index=False)

print(df.head())

print("\nDataset Shape:", df.shape)