from pydantic import BaseModel, EmailStr, Field

class UserLogin(BaseModel):
    national_id: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str = ""

class SuperAdminCreate(BaseModel):
    national_id: str
    name: str
    phone: str
    address: str
    email: EmailStr
    password: str = Field(min_length=8)

class OfficerCreate(BaseModel):
    national_id: str
    name: str
    phone: str
    address: str
    email: EmailStr
    password: str = Field(min_length=8)
    prison_id: int
