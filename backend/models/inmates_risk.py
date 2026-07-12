from sqlmodel import SQLModel, Field

class InmatesRiskBase(SQLModel):
    inmate_id: int = Field(foreign_key="inmate.inmate_id", primary_key=True)
    risk_level: str
    recidivism: int | None = None

class InmatesRisk(InmatesRiskBase, table=True):
    __tablename__ = "inmates_risk"
