# tests/test_doctor_appointments.py
import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from server.core.database import Base, get_db
from server.core.models import User, Appointment
from server.utils.hashing import hash_password
from datetime import datetime, timedelta
import os
import uuid

# Set the environment to use the test database
os.environ["TESTING"] = "True"

# Create the test database engine
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the test client for FastAPI
client = TestClient(app)

# Fixture to create a clean database for every test
@pytest.fixture(scope="function")
def db_session():
    # Create the tables in the test database
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()  # Rollback any changes after each test
        db.close()
        # Drop the tables after each test to ensure a clean slate
        Base.metadata.drop_all(bind=engine)

# Override the default get_db function to use the test database session
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

# Fixture for setting up a doctor and a patient in the database
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

# Test Cases for Doctor's Appointments Management
def test_retrieve_appointments_for_authenticated_doctor(client_with_db, setup_doctor_and_patient):
    doctor = setup_doctor_and_patient["doctor"]
    token = get_token(doctor.username, "doctorpassword")

    response = client_with_db.get(
        "/doctor/appointments",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "upcoming" in response.json()
    assert "completed" in response.json()
    assert "cancelled" in response.json()

def test_retrieve_appointments_with_invalid_token(client_with_db):
    invalid_token = "invalidtoken123"

    response = client_with_db.get(
        "/doctor/appointments",
        headers={"Authorization": f"Bearer {invalid_token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_retrieve_appointments_as_patient(client_with_db, setup_doctor_and_patient):
    patient = setup_doctor_and_patient["patient"]
    token = get_token(patient.username, "patientpassword")

    response = client_with_db.get(
        "/doctor/appointments",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_mark_appointment_as_completed(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]
    token = get_token(doctor.username, "doctorpassword")

    # Create an appointment
    appointment_time = datetime.now() + timedelta(days=1)
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=patient.id,
        appointment_datetime=appointment_time,
        reason="Checkup"
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    # Mark the appointment as completed
    response = client_with_db.patch(
        f"/appointments/{appointment.id}/complete",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Appointment marked as completed successfully"

def test_attempt_mark_completed_by_different_doctor(client_with_db, setup_doctor_and_patient, db_session):
    # Create another doctor with a unique username
    hashed_password = hash_password("anotherdoctorpassword")
    another_doctor_username = f"anotherdoctoruser_{uuid.uuid4().hex[:8]}"
    another_doctor = User(username=another_doctor_username, email=f"{another_doctor_username}@example.com", hashed_password=hashed_password, role="doctor")
    db_session.add(another_doctor)
    db_session.commit()
    db_session.refresh(another_doctor)

    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]

    # Create an appointment assigned to the original doctor
    appointment_time = datetime.now() + timedelta(days=2)
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=patient.id,
        appointment_datetime=appointment_time,
        reason="Follow-up"
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    # Attempt to mark the appointment as completed by a different doctor
    token = get_token(another_doctor.username, "anotherdoctorpassword")
    response = client_with_db.patch(
        f"/appointments/{appointment.id}/complete",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Appointment not found"

def test_attempt_mark_already_completed_appointment(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    token = get_token(doctor.username, "doctorpassword")

    # Create a completed appointment
    appointment_time = datetime.now() + timedelta(days=1)
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=setup_doctor_and_patient["patient"].id,
        appointment_datetime=appointment_time,
        reason="Checkup",
        isCompleted=True
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    # Attempt to mark the already completed appointment as completed again
    response = client_with_db.patch(
        f"/appointments/{appointment.id}/complete",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Appointment is already completed"
