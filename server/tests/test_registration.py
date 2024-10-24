# tests/test_registration.py

import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.core.database import Base, get_db
import server.core.models as models
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

# Fixtures for new users
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

# Test cases
def test_register_patient_success(client_with_db, new_user_patient):
    response = client_with_db.post("/register", json=new_user_patient)
    assert response.status_code == 200
    assert response.json()["username"] == new_user_patient["username"]
    assert response.json()["email"] == new_user_patient["email"]
    assert response.json()["role"] == new_user_patient["role"]

def test_register_doctor_success(client_with_db, new_user_doctor):
    response = client_with_db.post("/register", json=new_user_doctor)
    assert response.status_code == 200
    assert response.json()["username"] == new_user_doctor["username"]
    assert response.json()["email"] == new_user_doctor["email"]
    assert response.json()["role"] == new_user_doctor["role"]

def test_register_duplicate_username(client_with_db, new_user_patient):
    # Register the user once
    client_with_db.post("/register", json=new_user_patient)

    # Attempt to register the user again with the same username
    response = client_with_db.post("/register", json=new_user_patient)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_duplicate_email(client_with_db, new_user_patient):
    # Register the first user
    client_with_db.post("/register", json=new_user_patient)

    # Attempt to register a different user with the same email
    user_with_same_email = {
        "username": "differentusername",
        "email": new_user_patient["email"],
        "password": "differentpassword",
        "role": "doctor"
    }
    response = client_with_db.post("/register", json=user_with_same_email)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_missing_fields(client_with_db):
    user_missing_fields = {
        "username": "missingfields",
        # Missing email and password
        "role": "patient"
    }
    response = client_with_db.post("/register", json=user_missing_fields)
    assert response.status_code == 422  # Unprocessable Entity due to validation error

def test_register_invalid_email(client_with_db):
    user_invalid_email = {
        "username": "invalidemailuser",
        "email": "invalidemail.com",  # Invalid email format
        "password": "password123",
        "role": "patient"
    }
    response = client_with_db.post("/register", json=user_invalid_email)
    assert response.status_code == 422  # Validation error for email format
