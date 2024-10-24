# tests/test_profiles.py
import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy.orm import Session
from database import get_db
from models import User
from hashing import hash_password
import random
import string

client = TestClient(app)

def generate_unique_email():
    return f"testuser_{''.join(random.choices(string.ascii_lowercase + string.digits, k=5))}@example.com"

# Test fixture for setting up a patient and a doctor user in the database
@pytest.fixture(scope="function")
def setup_users():
    db: Session = next(get_db())
    try:
        # Create a patient user with a unique username
        hashed_password = hash_password("patientpassword")
        patient_username = f"patientuser_{''.join(random.choices(string.ascii_lowercase + string.digits, k=5))}"
        patient_user = User(username=patient_username, email=generate_unique_email(), hashed_password=hashed_password, role="patient")
        db.add(patient_user)

        # Create a doctor user with a unique username
        hashed_password = hash_password("doctorpassword")
        doctor_username = f"doctoruser_{''.join(random.choices(string.ascii_lowercase + string.digits, k=5))}"
        doctor_user = User(username=doctor_username, email=generate_unique_email(), hashed_password=hashed_password, role="doctor")
        db.add(doctor_user)

        db.commit()

        # Query the fresh copies of the users to ensure they're still bound to the session
        patient_user = db.query(User).filter_by(username=patient_username).first()
        doctor_user = db.query(User).filter_by(username=doctor_username).first()

        yield {"patient": patient_user, "doctor": doctor_user}

    finally:
        # Cleanup users after the test
        db.query(User).filter(User.id == patient_user.id).delete()
        db.query(User).filter(User.id == doctor_user.id).delete()
        db.commit()

    
# Patient Profile Tests
def test_create_patient_profile(setup_users):
    response = client.post("/patient-profile", json={
        "user_id": setup_users["patient"].id,
        "age": 30,
        "gender": "female",
        "address": "123 Patient St"
    })
    assert response.status_code == 200
    assert response.json()["age"] == 30

def test_create_patient_profile_invalid_user():
    response = client.post("/patient-profile", json={
        "user_id": 9999,  # Non-existent user ID
        "age": 30,
        "gender": "female",
        "address": "123 Patient St"
    })
    assert response.status_code == 404

def test_create_patient_profile_duplicate(setup_users):
    response = client.post("/patient-profile", json={
        "user_id": setup_users["patient"].id,
        "age": 30,
        "gender": "female",
        "address": "123 Patient St"
    })
    assert response.status_code == 400

# Doctor Profile Tests
def test_create_doctor_profile(setup_users):
    response = client.post("/doctor-profile", json={
        "user_id": setup_users["doctor"].id,
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 200
    assert response.json()["specialization"] == "Cardiology"

def test_create_doctor_profile_duplicate(setup_users):
    response = client.post("/doctor-profile", json={
        "user_id": setup_users["doctor"].id,
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 400  # Doctor profile already exists

def test_create_doctor_profile_invalid_role(setup_users):
    response = client.post("/doctor-profile", json={
        "user_id": setup_users["patient"].id,  # Patient trying to create a doctor profile
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 400  # Patient cannot create doctor profile

def test_create_doctor_profile_invalid_user():
    response = client.post("/doctor-profile", json={
        "user_id": 9999,  # Non-existent user ID
        "specialization": "Cardiology",
        "experience": 10,
        "qualification": "MBBS",
        "address": "456 Doctor Blvd"
    })
    assert response.status_code == 404  # User not found
