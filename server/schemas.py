from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import List

# Define Role Enum for Pydantic Models
class RoleEnum(str, Enum):
    doctor = "doctor"
    patient = "patient"

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: RoleEnum

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: RoleEnum

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: RoleEnum

# Patient Schemas
class PatientCreate(BaseModel):
    user_id: int  # Include user_id to link with the User table
    age: int
    gender: str
    address: str

class PatientResponse(BaseModel):
    id: int
    user_id: int
    age: int
    gender: str
    address: str

    class Config:
        orm_mode = True
# Doctor Schemas
class DoctorCreate(BaseModel):
    user_id: int  # Include user_id to link with the User table
    specialization: str
    experience: int
    qualification: str
    address: str

class DoctorResponse(BaseModel):
    username: str
    id: int
    user_id: int
    specialization: str
    experience: int
    qualification: str
    address: str

    class Config:
        orm_mode = True

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_datetime: datetime
    reason: str

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_datetime: datetime
    reason: str
    is_completed: bool
    is_cancelled: bool
    feedback: str

    class Config:
        orm_mode = True
    
class FeedbackRequest(BaseModel):
    feedback: str

class FeedbackResponse(BaseModel):
    id: int
    feedback: str

    class Config:
        orm_mode = True

# Schema for symptoms input
class ChatMessage(BaseModel):
    role: str
    content: str

class SymptomsInput(BaseModel):
    chatHistory: List[ChatMessage]

class VirtualAssistantResponse(BaseModel):
    suggestions: List[str]

class FeedbackSummaryResponse(BaseModel):
    summary: str