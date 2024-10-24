from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session , joinedload
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta, datetime
from typing import List
import os
from groq import Groq
from dotenv import load_dotenv
from database import get_db, engine
import models
from schemas import UserCreate, UserResponse, Token, PatientResponse, PatientCreate , DoctorResponse, DoctorCreate, AppointmentCreate , FeedbackRequest , SymptomsInput , FeedbackResponse , SymptomsInput , VirtualAssistantResponse , FeedbackSummaryResponse , RecommenderInput
from hashing import hash_password, verify_password
from oauth2 import create_access_token, oauth2_scheme, verify_token

models.Base.metadata.create_all(bind=engine)

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY is None:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please set it in the .env file.")
client = Groq(api_key=GROQ_API_KEY)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# User Registration
@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if a user with the same username already exists
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists.")

    # Check if a user with the same email already exists
    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists.")

    # Hash password and create user
    hashed_password = hash_password(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# Login and Token Generation
@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# Example protected route
@app.get("/users/me", response_model=UserResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    username = verify_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/patient-profile", response_model=PatientResponse)
def create_patient_profile(profile: PatientCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Proceed only if the user exists
    existing_profile = db.query(models.Patient).filter(models.Patient.user_id == profile.user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Patient profile already exists for this user")

    # Create a new patient profile
    db_profile = models.Patient(
        user_id=profile.user_id,
        age=profile.age,
        gender=profile.gender,
        address=profile.address
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return db_profile

@app.post("/doctor-profile", response_model=DoctorResponse)
def create_doctor_profile(profile: DoctorCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user has the correct role (doctor)
    if user.role.value != "doctor":
        raise HTTPException(status_code=400, detail="Only users with role 'doctor' can create a doctor profile")

    # Check if a doctor profile already exists for the given user_id
    existing_profile = db.query(models.Doctor).filter(models.Doctor.user_id == profile.user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Doctor profile already exists for this user")

    # Create new doctor profile
    db_profile = models.Doctor(
        user_id=profile.user_id,
        specialization=profile.specialization,
        experience=profile.experience,
        qualification=profile.qualification,
        address=profile.address
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    # Prepare the response including the username from the User model
    response_data = DoctorResponse(
        id=db_profile.id,
        user_id=db_profile.user_id,
        specialization=db_profile.specialization,
        experience=db_profile.experience,
        qualification=db_profile.qualification,
        address=db_profile.address,
        username=user.username  # Include the username from the related User model
    )

    return response_data



# Get All Doctors with User Information
@app.get("/doctors", response_model=list[DoctorResponse])
def get_all_doctors(db: Session = Depends(get_db)):
    doctors = db.query(models.Doctor).all()
    response_data = []

    for doctor in doctors:
        response_data.append({
            "id": doctor.id,
            "user_id": doctor.user_id,
            "specialization": doctor.specialization,
            "experience": doctor.experience,
            "qualification": doctor.qualification,
            "address": doctor.address,
            "username": doctor.user.username  # Fetch the related username from User table
        })
    
    return response_data

@app.get("/doctors/{id}", response_model=DoctorResponse)
def get_doctor_by_id(id: int, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    response_data = {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "specialization": doctor.specialization,
        "experience": doctor.experience,
        "qualification": doctor.qualification,
        "address": doctor.address,
        "username": doctor.user.username  # Fetch the related username from User table
    }
    
    return response_data

@app.post("/appointment", response_model=UserResponse)
def appointment(appointment: AppointmentCreate, token: str = Depends(oauth2_scheme) , db: Session = Depends(get_db)):
        
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    username = verify_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.username == username).first()    # Create user with role
    db_appointment = models.Appointment(
        doctor_id=appointment.doctor_id,
        patient_id=user.id,
        appointment_datetime = appointment.appointment_datetime,
        reason = appointment.reason
    )    
    print(db_appointment)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return user


@app.get("/dashboard/appointments")
def get_patient_appointments(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify the token to get the current username
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    username = verify_token(token, credentials_exception)

    # Get the user from the database
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.role.value != "patient":
        raise credentials_exception

    # Fetch patient appointments
    current_datetime = datetime.now()
    appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == user.id).all()

    # Classify appointments into upcoming, past, and cancelled
    upcoming_appointments = []
    past_appointments = []
    cancelled_appointments = []

    for appointment in appointments:
        print(appointment)
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == appointment.doctor_id).first()
        doctor_name = doctor.user.username if doctor else "Unknown"

        if appointment.isCancelled:
            cancelled_appointments.append({
                "id": appointment.id,
                "doctor_id": appointment.doctor_id,
                "doctor_name": doctor_name,
                "appointment_datetime": appointment.appointment_datetime,
                "reason": appointment.reason,
            })
        elif appointment.appointment_datetime >= current_datetime and not appointment.isCompleted:
            upcoming_appointments.append({
                "id": appointment.id,
                "doctor_id": appointment.doctor_id,
                "doctor_name": doctor_name,
                "appointment_datetime": appointment.appointment_datetime,
                "reason": appointment.reason,
            })
        elif appointment.isCompleted:
            past_appointments.append({
                "id": appointment.id,
                "doctor_id": appointment.doctor_id,
                "doctor_name": doctor_name,
                "appointment_datetime": appointment.appointment_datetime,
                "reason": appointment.reason,
                "isCompleted": appointment.isCompleted,
                "feedback": appointment.feedback,
            })

    # Format the response
    response_data = {
        "upcoming": upcoming_appointments,
        "past": past_appointments,
        "cancelled": cancelled_appointments,
    }

    return response_data


@app.put("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify the token to get the current username
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    username = verify_token(token, credentials_exception)

    # Get the user from the database
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.role.value != "patient":
        raise credentials_exception

    # Get the appointment
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.patient_id == user.id
    ).first()

    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appointment.isCancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Appointment is already cancelled")

    # Mark the appointment as cancelled
    appointment.isCancelled = True
    db.commit()

    return {"message": "Appointment cancelled successfully"}




@app.put("/appointments/{appointment_id}/feedback")
def submit_feedback(appointment_id: int, request: FeedbackRequest, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify the token to get the current username
    print(appointment_id)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    username = verify_token(token, credentials_exception)
    
    # Get the user from the database
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.role.value != "patient":
        raise credentials_exception

    # Get the appointment
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.patient_id == user.id
    ).first()

    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # Update the appointment feedback
    appointment.feedback = request.feedback
    db.commit()

from sqlalchemy.orm import joinedload

@app.get("/doctor/appointments")
def get_doctor_appointments(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify the token to get the current username
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    username = verify_token(token, credentials_exception)

    # Get the user from the database
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.role.value != "doctor":
        raise credentials_exception

    # Fetch doctor appointments
    current_datetime = datetime.now()
    appointments = db.query(models.Appointment).filter(models.Appointment.doctor_id == user.id).all()

    # Classify appointments into upcoming, past, and cancelled
    upcoming_appointments = []
    completed_appointments = []
    cancelled_appointments = []

    for appointment in appointments:

        patient = db.query(models.Patient).filter(models.Patient.user_id == appointment.patient_id).first()
        patient_name = patient.user.username if patient else "Unknown"
        print(patient_name)

        appointment_data = {
            "id": appointment.id,
            "patient_name": patient_name,
            "appointment_datetime": appointment.appointment_datetime,
            "reason": appointment.reason,
            "feedback": appointment.feedback
        }

        if appointment.isCancelled:
            cancelled_appointments.append(appointment_data)
        elif appointment.isCompleted:
            completed_appointments.append(appointment_data)
        elif appointment.appointment_datetime >= current_datetime:
            upcoming_appointments.append(appointment_data)

    # Format the response
    response_data = {
        "upcoming": upcoming_appointments,
        "completed": completed_appointments,
        "cancelled": cancelled_appointments,
    }

    return response_data


@app.patch("/appointments/{appointment_id}/complete")
def mark_appointment_as_completed(appointment_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify the token to get the current username
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )

    username = verify_token(token, credentials_exception)
    print(username)

    # Get the user from the database and ensure they are a doctor
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.role.value != "doctor":
        raise credentials_exception

    # Get the appointment
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

    if not appointment or appointment.doctor_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appointment.isCompleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Appointment is already completed")

    # Mark the appointment as completed
    appointment.isCompleted = True
    db.commit()

    return {"message": "Appointment marked as completed successfully"}

@app.patch("/appointments/{appointment_id}/cancel")
def cancel_appointment_by_doctor(appointment_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify the token to get the current username
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    username = verify_token(token, credentials_exception)

    # Get the user from the database and ensure they are a doctor
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.role.value != "doctor":
        raise credentials_exception

    # Get the appointment
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

    if not appointment or appointment.doctor_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appointment.isCancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Appointment is already cancelled")

    # Mark the appointment as cancelled
    appointment.isCancelled = True
    db.commit()

    return {"message": "Appointment cancelled successfully"}

@app.post("/recommend-doctor")
def recommend_doctor(input: RecommenderInput, db: Session = Depends(get_db)):

    # Prepare Groq API request
    system_prompt = {
        "role": "system",
        "content": "You are an assistant that specializes in identifying the required medical doctor specialization based on symptoms. Provide only one word which is the specialization. For example, Cardiologist, Dermatologist, etc."
    }
    
    chat_history = [system_prompt, {"role": "user", "content": input.symptoms}]

    try:
        # Get response from Groq API
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=chat_history,
            max_tokens=10,  # Keeping max_tokens low since we need only one word
            temperature=0.5
        )

        specialization = response.choices[0].message.content.strip()

        # Query doctors based on the recommended specialization
        doctors = db.query(models.Doctor).filter(models.Doctor.specialization.ilike(f"%{specialization}%")).all()

        if not doctors:
            raise HTTPException(status_code=404, detail="No doctors found for the given specialization.")

        # Format response data
        doctors_list = [
            {
                "id": doctor.id,
                "user_id": doctor.user_id,
                "username": doctor.user.username,
                "specialization": doctor.specialization,
                "experience": doctor.experience,
                "address": doctor.address,
            }
            for doctor in doctors
        ]

        return {"doctors": doctors_list}

    except Exception as e:
        print(f"Error in Groq API request: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a recommendation from AI.")
    
@app.get("/api/doctors/{doctor_id}/feedbacks", response_model=List[FeedbackResponse])
def get_doctor_feedbacks(doctor_id: int, db: Session = Depends(get_db)):
    # Verify if the doctor exists in the database
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    # Fetch all appointments for the doctor that have feedback
    appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.feedback.isnot(None)
    ).all()

    # Extract feedbacks from appointments and format response
    feedbacks = [
        {
            "id": appointment.id,
            "feedback": appointment.feedback,
        }
        for appointment in appointments
    ]

    return feedbacks


def format_assistant_reply(text):
    # Breaking the response into parts and formatting
    parts = text.split('*')
    formatted_parts = ["<strong>Assistant:</strong> " + parts[0].strip()]  # Adding bold to the assistant label
    for part in parts[1:]:
        formatted_parts.append("• " + part.strip())  # Adding bullet points to each item

    formatted_text = "<br>".join(formatted_parts)  # Joining parts with line breaks for HTML
    return formatted_text


@app.post("/virtual-assistant", response_model=VirtualAssistantResponse)
def virtual_assistant(input: SymptomsInput, db: Session = Depends(get_db)):

        # Define the system prompt for the AI to guide its behavior
    system_prompt = {
        "role": "system",
        "content": "You are a medical assistant helping a patient prepare for their doctor's appointment. Based on the symptoms they provide, generate a concise list of questions they should ask their doctor and possible information they should prepare before the appointment. Keep responses short , brief and to the point. Ask one question at atime. Do not ask many questions"
    }

    chat_history = [system_prompt] + input.chatHistory


    try:
        # Pass the entire chat history to the model
        response = client.chat.completions.create(
            model="llama3-70b-8192",  # Replace with an appropriate Groq model
            messages=chat_history,  # Full chat history sent to the model
            max_tokens=150,
            temperature=0.7,
        )

        # Extract the assistant's reply
        assistant_reply = response.choices[0].message.content.strip()
        formatted_reply = format_assistant_reply(assistant_reply)  # Format the reply

        # Split reply into suggestions (if there are multiple suggestions)
        suggestions = assistant_reply.split("\n")
        suggestions = formatted_reply.split("<br>")  # Split formatted reply into multiple parts if necessary

        return {"suggestions": suggestions}

    except Exception as e:
        print(f"Error communicating with Groq API: {e}")
        raise HTTPException(status_code=500, detail="Error generating response from AI")
    
@app.get("/doctor/feedback-summary", response_model=FeedbackSummaryResponse)
def get_feedback_summary(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # Verify the token and get the doctor's information
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
        username = verify_token(token, credentials_exception)

        # Fetch the user information and ensure it is a doctor
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user or user.role.value != "doctor":
            raise credentials_exception

        doctor_id = user.id

        # Get all feedbacks for the given doctor ID
        appointments = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doctor_id,
            models.Appointment.feedback.isnot(None)
        ).all()

        # Extract feedbacks from appointments
        feedbacks = [appointment.feedback for appointment in appointments if appointment.feedback]

        if not feedbacks:
            return {"summary": "No feedbacks available."}

        # Create a prompt for Groq API to generate the summary
        prompt = f"Summarize the following patient feedbacks into short phrases that can be directly displayed under 'Feedback Insights' on a website. Do not include any introductory phrases, headers, or follow-up questions, and avoid phrases like 'Here is a summary'. Only provide the key feedback points. This summary is intended for doctor to improve his service. So the response should be addressed to a doctor.Remember not to include any introductory phrases, headers, or follow-up questions.Feedbacks: {feedbacks}"

        # Call Groq API to generate the summary
        response = client.chat.completions.create(
            model="llama3-70b-8192",  # Adjust as needed
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7,
        )

        # Extract the generated summary
        summary = response.choices[0].message.content.strip()

        return {"summary": summary}

    except Exception as e:
        print(f"Error generating feedback summary: {e}")
        raise HTTPException(status_code=500, detail="Error generating feedback summary")