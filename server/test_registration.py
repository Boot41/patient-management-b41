# tests/test_registration.py

import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy.orm import Session
from database import get_db, engine
import models

client = TestClient(app)

@pytest.fixture(scope="function")
def new_user_patient():
    return {
        "username": "testpatient",
        "email": "testpatient@example.com",
        "password": "password123",
        "role": "patient"
    }

@pytest.fixture(scope="function")
def new_user_doctor():
    return {
        "username": "testdoctor",
        "email": "testdoctor@example.com",
        "password": "password123",
        "role": "doctor"
    }

@pytest.fixture(scope="function", autouse=True)
def clean_up():
    # Ensure database is clean before each test
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    yield

    # Clean database after each test to avoid affecting other tests
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

def test_register_patient_success(new_user_patient):
    response = client.post("/register", json=new_user_patient)
    assert response.status_code == 200
    assert response.json()["username"] == new_user_patient["username"]
    assert response.json()["email"] == new_user_patient["email"]
    assert response.json()["role"] == new_user_patient["role"]

def test_register_doctor_success(new_user_doctor):
    response = client.post("/register", json=new_user_doctor)
    assert response.status_code == 200
    assert response.json()["username"] == new_user_doctor["username"]
    assert response.json()["email"] == new_user_doctor["email"]
    assert response.json()["role"] == new_user_doctor["role"]

def test_register_duplicate_username(new_user_patient):
    # Register the user once
    client.post("/register", json=new_user_patient)
    
    # Attempt to register the user again with the same username
    response = client.post("/register", json=new_user_patient)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_duplicate_email(new_user_patient):
    # Register the first user
    client.post("/register", json=new_user_patient)
    
    # Attempt to register a different user with the same email
    user_with_same_email = {
        "username": "differentusername",
        "email": new_user_patient["email"],
        "password": "differentpassword",
        "role": "doctor"
    }
    response = client.post("/register", json=user_with_same_email)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_missing_fields():
    user_missing_fields = {
        "username": "missingfields",
        # Missing email and password
        "role": "patient"
    }
    response = client.post("/register", json=user_missing_fields)
    assert response.status_code == 422  # Unprocessable Entity due to validation error

def test_register_invalid_email():
    user_invalid_email = {
        "username": "invalidemailuser",
        "email": "invalidemail.com",  # Invalid email format
        "password": "password123",
        "role": "patient"
    }
    response = client.post("/register", json=user_invalid_email)
    assert response.status_code == 422  # Validation error for email format

