# tests/test_feedback_management.py
import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database import Base, get_db
from models import User, Appointment
from hashing import hash_password
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
    # Create a doctor user
    hashed_password = hash_password("doctorpassword")
    doctor_username = f"doctoruser_{uuid.uuid4().hex[:8]}"
    doctor_user = User(username=doctor_username, email=f"{doctor_username}@example.com", hashed_password=hashed_password, role="doctor")
    db_session.add(doctor_user)

    # Create a patient user
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

# Test Cases for Feedback Management
def test_submit_feedback_for_completed_appointment(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]
    token = get_token(patient.username, "patientpassword")

    # Create a completed appointment
    appointment_time = datetime.now() - timedelta(days=1)  # Set a past date to mark as completed
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=patient.id,
        appointment_datetime=appointment_time,
        reason="General Checkup",
        isCompleted=True  # Mark the appointment as completed
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    # Submit feedback for the completed appointment
    response = client_with_db.put(
        f"/appointments/{appointment.id}/feedback",
        json={"feedback": "The appointment went well"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Feedback submitted successfully"

def test_submit_feedback_for_non_existing_appointment(client_with_db, setup_doctor_and_patient):
    patient = setup_doctor_and_patient["patient"]
    token = get_token(patient.username, "patientpassword")

    # Attempt to submit feedback for a non-existing appointment
    response = client_with_db.put(
        "/appointments/99999/feedback",  # Non-existing appointment ID
        json={"feedback": "This appointment does not exist"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Appointment not found"

def test_submit_feedback_for_appointment_not_belonging_to_user(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]
    token = get_token(patient.username, "patientpassword")

    # Create an appointment that belongs to another patient
    another_patient_username = f"another_patient_{uuid.uuid4().hex[:8]}"
    another_patient = User(
        username=another_patient_username,
        email=f"{another_patient_username}@example.com",
        hashed_password=hash_password("anotherpassword"),
        role="patient"
    )
    db_session.add(another_patient)
    db_session.commit()
    db_session.refresh(another_patient)

    appointment_time = datetime.now() - timedelta(days=1)
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=another_patient.id,
        appointment_datetime=appointment_time,
        reason="Different Checkup",
        isCompleted=True
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    # Attempt to submit feedback for an appointment that does not belong to the user
    response = client_with_db.put(
        f"/appointments/{appointment.id}/feedback",
        json={"feedback": "This appointment does not belong to me"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404  # Appointment not found since the appointment doesn't belong to the user

def test_submit_feedback_for_incomplete_appointment(client_with_db, setup_doctor_and_patient, db_session):
    doctor = setup_doctor_and_patient["doctor"]
    patient = setup_doctor_and_patient["patient"]
    token = get_token(patient.username, "patientpassword")

    # Create an incomplete appointment
    appointment_time = datetime.now() + timedelta(days=1)  # Future appointment, hence incomplete
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=patient.id,
        appointment_datetime=appointment_time,
        reason="Future Checkup",
        isCompleted=False
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    # Attempt to submit feedback for the incomplete appointment
    response = client_with_db.put(
        f"/appointments/{appointment.id}/feedback",
        json={"feedback": "Cannot submit feedback for incomplete appointment"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot submit feedback for an incomplete appointment"
