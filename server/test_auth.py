import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Fixtures for patient and doctor user data
@pytest.fixture
def patient_user():
    return {
        "username": "patientuser",
        "email": "patientuser@example.com",
        "password": "patientpassword",
        "role": "patient"
    }

@pytest.fixture
def doctor_user():
    return {
        "username": "doctoruser",
        "email": "doctoruser@example.com",
        "password": "doctorpassword",
        "role": "doctor"
    }

@pytest.fixture
def invalid_user():
    return {
        "username": "invaliduser",
        "password": "invalidpassword"
    }

# Register a patient user
@pytest.fixture
def register_patient(patient_user):
    client.post("/register", json=patient_user)

# Register a doctor user
@pytest.fixture
def register_doctor(doctor_user):
    client.post("/register", json=doctor_user)

# Test Case 1: Obtain a token for a registered patient
def test_token_for_registered_patient(register_patient, patient_user):
    response = client.post("/token", data={
        "username": patient_user["username"],
        "password": patient_user["password"],
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

# Test Case 2: Obtain a token for a registered doctor
def test_token_for_registered_doctor(register_doctor, doctor_user):
    response = client.post("/token", data={
        "username": doctor_user["username"],
        "password": doctor_user["password"],
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

# Test Case 3: Attempt to obtain a token with invalid credentials
def test_token_with_invalid_credentials(invalid_user):
    response = client.post("/token", data={
        "username": invalid_user["username"],
        "password": invalid_user["password"],
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

# Test Case 4: Attempt to obtain a token with unregistered credentials
def test_token_with_unregistered_credentials():
    response = client.post("/token", data={
        "username": "unregistereduser",
        "password": "unregisteredpassword",
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

# Test Case 5: Attempt to access a protected route without a token
def test_access_protected_route_without_token():
    response = client.get("/users/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
