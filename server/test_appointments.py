# tests/test_appointments.py
import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy.orm import Session
from database import get_db
from models import User, Doctor, Appointment
from hashing import hash_password
from datetime import datetime, timedelta
import random
import string

client = TestClient(app)

def generate_unique_string(prefix):
    return f"{prefix}_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"

@pytest.fixture(scope="function")
def setup_patient_and_doctor():
    db: Session = next(get_db())

    # Create a patient user
    hashed_password = hash_password("patientpassword")
    patient_username = generate_unique_string("patientuser")
    patient_email = generate_unique_string("patientuser") + "@example.com"
    patient_user = User(username=patient_username, email=patient_email, hashed_password=hashed_password, role="patient")
    db.add(patient_user)

    # Create a doctor user
    hashed_password = hash_password("doctorpassword")
    doctor_username = generate_unique_string("doctoruser")
    doctor_email = generate_unique_string("doctoruser") + "@example.com"
    doctor_user = User(username=doctor_username, email=doctor_email, hashed_password=hashed_password, role="doctor")
    db.add(doctor_user)

    db.commit()
    db.refresh(patient_user)
    db.refresh(doctor_user)
    db.close()

    return {"patient": patient_user, "doctor": doctor_user}

@pytest.fixture
def patient_token(setup_patient_and_doctor):
    response = client.post("/token", data={"username": setup_patient_and_doctor["patient"].username, "password": "patientpassword"})
    return response.json()["access_token"]

# Appointment Tests
def test_create_appointment_valid(patient_token, setup_patient_and_doctor):
    doctor_id = setup_patient_and_doctor["doctor"].id
    appointment_time = (datetime.now() + timedelta(days=1)).isoformat()
    response = client.post("/appointment", json={
        "doctor_id": doctor_id,
        "appointment_datetime": appointment_time,
        "reason": "General Checkup"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    
    assert response.status_code == 200
    assert response.json()["username"] == setup_patient_and_doctor["patient"].username

def test_create_appointment_without_token(setup_patient_and_doctor):
    doctor_id = setup_patient_and_doctor["doctor"].id
    appointment_time = (datetime.now() + timedelta(days=1)).isoformat()
    response = client.post("/appointment", json={
        "doctor_id": doctor_id,
        "appointment_datetime": appointment_time,
        "reason": "General Checkup"
    })
    
    assert response.status_code == 401

def test_create_appointment_invalid_doctor(patient_token):
    appointment_time = (datetime.now() + timedelta(days=1)).isoformat()
    response = client.post("/appointment", json={
        "doctor_id": 9999,  # Non-existent doctor ID
        "appointment_datetime": appointment_time,
        "reason": "General Checkup"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    
    assert response.status_code == 404

def test_create_double_booking(patient_token, setup_patient_and_doctor):
    doctor_id = setup_patient_and_doctor["doctor"].id
    appointment_time = (datetime.now() + timedelta(days=1)).isoformat()
    
    # Create the first appointment
    client.post("/appointment", json={
        "doctor_id": doctor_id,
        "appointment_datetime": appointment_time,
        "reason": "General Checkup"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    
    # Attempt to create an overlapping appointment
    response = client.post("/appointment", json={
        "doctor_id": doctor_id,
        "appointment_datetime": appointment_time,
        "reason": "Follow-up"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    
    assert response.status_code == 400

# Dashboard Tests
def test_get_appointments_dashboard(patient_token):
    response = client.get("/dashboard/appointments", headers={"Authorization": f"Bearer {patient_token}"})
    assert response.status_code == 200
    assert "upcoming" in response.json()

def test_get_appointments_dashboard_unauthenticated():
    response = client.get("/dashboard/appointments")
    assert response.status_code == 401

# Appointment Cancellation Tests
def test_cancel_appointment(patient_token, setup_patient_and_doctor):
    doctor_id = setup_patient_and_doctor["doctor"].id
    appointment_time = (datetime.now() + timedelta(days=1)).isoformat()
    
    # Create an appointment
    response = client.post("/appointment", json={
        "doctor_id": doctor_id,
        "appointment_datetime": appointment_time,
        "reason": "General Checkup"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    
    appointment_id = response.json()["id"]
    
    # Cancel the appointment
    response = client.put(f"/appointments/{appointment_id}/cancel", headers={"Authorization": f"Bearer {patient_token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Appointment cancelled successfully"

def test_cancel_already_cancelled_appointment(patient_token, setup_patient_and_doctor):
    doctor_id = setup_patient_and_doctor["doctor"].id
    appointment_time = (datetime.now() + timedelta(days=1)).isoformat()
    
    # Create an appointment
    response = client.post("/appointment", json={
        "doctor_id": doctor_id,
        "appointment_datetime": appointment_time,
        "reason": "General Checkup"
    }, headers={"Authorization": f"Bearer {patient_token}"})
    
    appointment_id = response.json()["id"]
    
    # Cancel the appointment
    client.put(f"/appointments/{appointment_id}/cancel", headers={"Authorization": f"Bearer {patient_token}"})
    
    # Attempt to cancel the already cancelled appointment
    response = client.put(f"/appointments/{appointment_id}/cancel", headers={"Authorization": f"Bearer {patient_token}"})
    assert response.status_code == 400

def test_cancel_appointment_invalid_appointment_id(patient_token):
    response = client.put("/appointments/9999/cancel", headers={"Authorization": f"Bearer {patient_token}"})
    assert response.status_code == 404
