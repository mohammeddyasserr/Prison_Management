from .prison import router as prison_router
from .block import router as block_router
from .cell import router as cell_router
from . import inmate , legal_case , shift

routers = [
    prison_router,
    block_router,
    cell_router
]

