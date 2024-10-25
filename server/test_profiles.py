# tests/test_profiles.py
import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database import Base, get_db
from models import User
from hashing import hash_password
import random
import string
import uuid
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

# Utility function to generate a unique email
def generate_unique_email():
    return f"testuser_{''.join(random.choices(string.ascii_lowercase + string.digits, k=5))}@example.com"

# Test fixture for setting up a patient and a doctor user in the database
@pytest.fixture(scope="function")
def setup_users(db_session):
    # Create a patient user with a unique username
    hashed_password = hash_password("patientpassword")
    patient_username = f"patientuser_{uuid.uuid4().hex[:8]}"
    patient_user = User(username=patient_username, email=generate_unique_email(), hashed_password=hashed_password, role="patient")
    db_session.add(patient_user)

    # Create a doctor user with a unique username
    hashed_password = hash_password("doctorpassword")
    doctor_username = f"doctoruser_{uuid.uuid4().hex[:8]}"
    doctor_user = User(username=doctor_username, email=generate_unique_email(), hashed_password=hashed_password, role="doctor")
    db_session.add(doctor_user)

    db_session.commit()

    yield {"patient_id": patient_user.id, "doctor_id": doctor_user.id}

# Patient Profile Tests
def test_create_patient_profile(client_with_db, setup_users, db_session):
    patient = db_session.query(User).get(setup_users["patient_id"])  # Fetch the patient with active session
    response = client_with_db.post("/patient-profile", json={
        "user_id": patient.id,
        "age": 30,
        "gender": "female",
        "address": "123 Patient St"
    })
    assert response.status_code == 200
    assert response.json()["age"] == 30

def test_create_patient_profile_invalid_user(client_with_db):
    response = client_with_db.post("/patient-profile", json={
        "user_id": 9999,  # Non-existent user ID
        "age": 30,
        "gender": "female",
        "address": "123 Patient St"
    })
    assert response.status_code == 404


# Doctor Profile Tests
def test_create_doctor_profile(client_with_db, setup_users, db_session):
    doctor = db_session.query(User).get(setup_users["doctor_id"])  # Fetch the doctor with active session
    response = client_with_db.post("/doctor-profile", json={
        "user_id": doctor.id,
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 200
    assert response.json()["specialization"] == "Cardiology"

def test_create_doctor_profile_duplicate(client_with_db, setup_users, db_session):
    doctor = db_session.query(User).get(setup_users["doctor_id"])  # Fetch the doctor with active session
    # Create the profile for the doctor user
    response = client_with_db.post("/doctor-profile", json={
        "user_id": doctor.id,
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 200

    # Attempt to create the profile again, which should fail
    response = client_with_db.post("/doctor-profile", json={
        "user_id": doctor.id,
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 400  # Doctor profile already exists

def test_create_doctor_profile_invalid_role(client_with_db, setup_users, db_session):
    patient = db_session.query(User).get(setup_users["patient_id"])  # Fetch the patient with active session
    response = client_with_db.post("/doctor-profile", json={
        "user_id": patient.id,  # Patient trying to create a doctor profile
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 400  # Patient cannot create doctor profile

def test_create_doctor_profile_invalid_user(client_with_db):
    response = client_with_db.post("/doctor-profile", json={
        "user_id": 9999,  # Non-existent user ID
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 404  # User not found
