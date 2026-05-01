from .prison import PrisonCreate, PrisonResponse
from .block import BlockCreate, BlockResponse
from .cell import CellCreate, CellResponse
from .inmate import InmateCreate , InmateResponse
from .legal_case import LegalCaseCreate, LegalCaseResponse
from .shift import ShiftCreate, ShiftResponse
from .doctor import DoctorResponse, DoctorCreate
from .medical_visit import MedicalVisitResponse, MedicalVisitCreate

__all__ = [
    "PrisonCreate", "PrisonResponse",
    "BlockCreate", "BlockResponse",
    "CellCreate", "CellResponse"
]

