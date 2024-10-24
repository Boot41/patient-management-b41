# tests/test_appointments_management.py
import pytest
from fastapi.testclient import TestClient
from ..main import app
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.models import User, Appointment
from utils.hashing import hash_password
from datetime import datetime, timedelta
import os
import uuid

os.environ["TESTING"] = "True"

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    """Provides a test database session for each function."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from server.core.database import Base

    DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client_with_db(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def setup_doctor_and_patient(db_session):
    # Create a doctor user with a unique username
    hashed_password = hash_password("doctorpassword")
    doctor_username = f"doctoruser_{uuid.uuid4().hex[:8]}"
    doctor_user = User(username=doctor_username, email=f"{doctor_username}@example.com", hashed_password=hashed_password, role="doctor")
    db_session.add(doctor_user)

    # Create a patient user with a unique username
    hashed_password = hash_password("patientpassword")
    patient_username = f"patientuser_{uuid.uuid4().hex[:8]}"
    patient_user = User(username=patient_username, email=f"{patient_username}@example.com", hashed_password=hashed_password, role="patient")
    db_session.add(patient_user)

    db_session.commit()
    db_session.refresh(doctor_user)
    db_session.refresh(patient_user)

    return {"doctor": doctor_user, "patient": patient_user}

# Helper function to get token for a user
def get_token(username, password):
    response = client.post("/token", data={"username": username, "password": password})
    return response.json().get("access_token")

# Doctor Appointments Test Cases
def test_get_appointments_as_doctor(client_with_db, setup_doctor_and_patient):
    doctor = setup_doctor_and_patient["doctor"]
    token = get_token(doctor.username, "doctorpassword")

    response = client_with_db.get("/doctor/appointments", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "upcoming" in response.json()

def test_get_appointments_with_invalid_token(client_with_db):
    response = client_with_db.get("/doctor/appointments", headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401

def test_get_appointments_as_patient(client_with_db, setup_doctor_and_patient):
    patient = setup_doctor_and_patient["patient"]
    token = get_token(patient.username, "patientpassword")

    response = client_with_db.get("/doctor/appointments", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401  # Patient should not be able to access doctor appointments

# Mark Appointment as Completed Test Cases
def test_mark_appointment_as_completed(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]
    token = get_token(doctor.username, "doctorpassword")

    # Create an appointment
    appointment_time = datetime.now() + timedelta(days=1)
    appointment = Appointment(doctor_id=doctor.id, patient_id=patient.id, appointment_datetime=appointment_time, reason="Checkup")
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    response = client_with_db.patch(f"/appointments/{appointment.id}/complete", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_mark_completed_by_different_doctor(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    token = get_token(doctor.username, "doctorpassword")

    response = client_with_db.patch("/appointments/99999/complete", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404  # Non-existing appointment

# Cancel Appointment by Doctor Test Cases
def test_cancel_appointment_by_doctor(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]
    token = get_token(doctor.username, "doctorpassword")

    # Create an appointment
    appointment_time = datetime.now() + timedelta(days=1)
    appointment = Appointment(doctor_id=doctor.id, patient_id=patient.id, appointment_datetime=appointment_time, reason="Checkup")
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    response = client_with_db.patch(f"/appointments/{appointment.id}/cancel", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_cancel_already_cancelled_appointment(client_with_db, setup_doctor_and_patient):
    doctor = setup_doctor_and_patient["doctor"]
    token = get_token(doctor.username, "doctorpassword")

    # Attempt to cancel a non-existing appointment again
    response = client_with_db.patch(f"/appointments/99999/cancel", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404  # Non-existing appointment
