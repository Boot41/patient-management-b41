from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey , Boolean , DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum

# Enum for Role
class RoleEnum(enum.Enum):
    doctor = "doctor"
    patient = "patient"

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(RoleEnum), nullable=False)

    # Relationships
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    patient_profile = relationship("Patient", back_populates="user", uselist=False)

# Patient Model
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    address = Column(String, nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")



# Doctor Model
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    experience = Column(Integer, nullable=False)
    address = Column(String, nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")



#Appointment Model
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey('doctors.id'), nullable=False)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    appointment_datetime = Column(DateTime, nullable=False)
    isCompleted= Column(Boolean, default=False)
    isCancelled= Column(Boolean, default=False)
    feedback = Column(String, nullable=True)
    reason = Column(String, nullable=False)

    # Relationships
    doctor = relationship("Doctor", back_populates="appointments")
    patient = relationship("Patient", back_populates="appointments")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)


# Prescription Model
class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('doctors.id'), nullable=False)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    complaints = Column(String, nullable=False)
    medicines = Column(String, nullable=False)
    notes = Column(String, nullable=True)

    # Relationships
    appointment = relationship("Appointment", back_populates="prescription")
    doctor = relationship("Doctor", back_populates="prescriptions")
    patient = relationship("Patient", back_populates="prescriptions")