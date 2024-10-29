# FastAPI-React App

### Built using Dev41

## Overview
This repository contains the Patient Appointment Management System (PMS-B41), a full-stack web application built with FastAPI for the backend and React with Tailwind CSS for the frontend. The application provides an intuitive and seamless experience for managing patient appointments, doctor information, and patient-doctor interaction.


## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- User Registration & Login with role-based access control (patient and doctor)
- Appointment Booking and Cancellation options
- Patient and Doctor Dashboards with personalized appointment views
- Feedback System for patient reviews and AI based feeback insights.
- AI based doctor recommendation system using Groq LLM.
- Appointment Scheduling Assistant using Groq LLM for improved appointment management and virtual medical support
- Responsive design with a modern UI

## Technologies Used
- **Backend**: FastAPI
- **Frontend**: React
- **Database**: Sqlite
- **Styling**: Tailwind CSS

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Boot41/patient-management-b41.git
   cd patient-management-b41
   ```

## Running the application
- You can easily set up and run the application using Docker.

- In the project root directory, run the following command to build and start the application in detached mode:
   ```bash
   docker compose up -d
   ```
- Open your browser and navigate to http://localhost:3000 to interact with the application.


## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

