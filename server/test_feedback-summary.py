# tests/test_feedback_summary.py
import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database import Base, get_db
from models import User, Doctor, Appointment
from hashing import hash_password
from datetime import datetime, timedelta
import os

# Set the environment to use the test database
os.environ["TESTING"] = "True"

# Use the test database for testing purposes
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

# Fixture for setting up a doctor and a patient with feedback in the database
@pytest.fixture(scope="function")
def setup_doctor_with_feedback(db_session):
    # Create a doctor user
    hashed_password = hash_password("doctorpassword")
    doctor_user = User(username="doctor_with_feedback", email="doctor_with_feedback@example.com", hashed_password=hashed_password, role="doctor")
    db_session.add(doctor_user)
    db_session.commit()
    db_session.refresh(doctor_user)

    db_doctor = Doctor(
        user_id=doctor_user.id,
        specialization="Cardiology",
        experience=10,
        qualification="MBBS, MD",
        address="789 Feedback St"
    )
    db_session.add(db_doctor)
    db_session.commit()
    db_session.refresh(db_doctor)

    # Create a patient user
    hashed_password = hash_password("patientpassword")
    patient_user = User(username="patient_for_feedback", email="patient_for_feedback@example.com", hashed_password=hashed_password, role="patient")
    db_session.add(patient_user)
    db_session.commit()
    db_session.refresh(patient_user)

    # Create an appointment and add feedback
    appointment = Appointment(
        doctor_id=db_doctor.user_id,
        patient_id=patient_user.id,
        appointment_datetime=datetime.now() - timedelta(days=5),
        isCompleted=True,
        reason="Regular checkup",
        feedback="Great service!"
    )
    db_session.add(appointment)
    db_session.commit()
    db_session.refresh(appointment)

    return {"doctor": db_doctor, "patient": patient_user}

# Fixture for setting up a doctor without feedback in the database
@pytest.fixture(scope="function")
def setup_doctor_without_feedback(db_session):
    # Create a doctor user without feedback
    hashed_password = hash_password("doctorpassword")
    doctor_user = User(username="doctor_without_feedback", email="doctor_without_feedback@example.com", hashed_password=hashed_password, role="doctor")
    db_session.add(doctor_user)
    db_session.commit()
    db_session.refresh(doctor_user)

    db_doctor = Doctor(
        user_id=doctor_user.id,
        specialization="Dermatology",
        experience=8,
        qualification="MBBS, MD",
        address="101 Skin Lane"
    )
    db_session.add(db_doctor)
    db_session.commit()
    db_session.refresh(db_doctor)

    return {"doctor": db_doctor}

# Helper function to get a token
def get_token(username, password):
    response = client.post("/token", data={"username": username, "password": password})
    return response.json()["access_token"]

# Test cases
def test_feedback_summary_for_doctor_without_feedback(client_with_db, setup_doctor_without_feedback):
    doctor = setup_doctor_without_feedback["doctor"]
    token = get_token(doctor.user.username, "doctorpassword")

    response = client_with_db.get("/doctor/feedback-summary", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["summary"] == "No feedbacks available."

def test_feedback_summary_as_patient(client_with_db, setup_doctor_with_feedback):
    patient = setup_doctor_with_feedback["patient"]
    token = get_token(patient.username, "patientpassword")

    response = client_with_db.get("/doctor/feedback-summary", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_feedback_summary_with_invalid_token(client_with_db):
    invalid_token = "invalid_token_value"

    response = client_with_db.get("/doctor/feedback-summary", headers={"Authorization": f"Bearer {invalid_token}"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"
