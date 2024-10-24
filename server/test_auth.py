import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
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
def register_patient(client_with_db, patient_user):
    client_with_db.post("/register", json=patient_user)

# Register a doctor user
@pytest.fixture
def register_doctor(client_with_db, doctor_user):
    client_with_db.post("/register", json=doctor_user)

# Test Case 1: Obtain a token for a registered patient
def test_token_for_registered_patient(client_with_db, register_patient, patient_user):
    response = client_with_db.post("/token", data={
        "username": patient_user["username"],
        "password": patient_user["password"],
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

# Test Case 2: Obtain a token for a registered doctor
def test_token_for_registered_doctor(client_with_db, register_doctor, doctor_user):
    response = client_with_db.post("/token", data={
        "username": doctor_user["username"],
        "password": doctor_user["password"],
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

# Test Case 3: Attempt to obtain a token with invalid credentials
def test_token_with_invalid_credentials(client_with_db, invalid_user):
    response = client_with_db.post("/token", data={
        "username": invalid_user["username"],
        "password": invalid_user["password"],
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

# Test Case 4: Attempt to obtain a token with unregistered credentials
def test_token_with_unregistered_credentials(client_with_db):
    response = client_with_db.post("/token", data={
        "username": "unregistereduser",
        "password": "unregisteredpassword",
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

# Test Case 5: Attempt to access a protected route without a token
def test_access_protected_route_without_token(client_with_db):
    response = client_with_db.get("/users/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
