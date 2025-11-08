# Virtual Fencing & Health Monitoring System - MVP

This repository contains the complete source code for a functional Minimum Viable Product (MVP) of the Virtual Fencing and Health Monitoring System for Cattle. It sets up a local development environment using Docker to run the backend, frontend, and database. A Python script is included to simulate real-time data from cattle collars.

## Core Features

- **Backend API (Node.js/Express)**: Manages virtual fence boundaries and ingests time-series data from cattle collars.
- **Frontend Dashboard (React)**: An interactive map-based interface to draw, view, and manage fences, and to visualize real-time locations of cattle.
- **Database (PostgreSQL/TimescaleDB)**: Stores fence data and efficiently handles large volumes of time-series location and health data.
- **Data Simulator (Python)**: Mimics the BeagleBone Black gateway by sending realistic, periodic data payloads to the backend API.

## System Architecture (Local Development)

The system is containerized using Docker Compose and consists of three main services:

- **database**: The PostgreSQL server with the TimescaleDB extension enabled.
- **backend**: The Node.js API server that connects to the database.
- **frontend**: The React application, served by a lightweight web server (serve).

## Prerequisites

- **Docker & Docker Compose**: You must have Docker and Docker Compose installed on your local machine. [Get Docker](https://docs.docker.com/get-docker/)
- **Python 3**: Required to run the simulator.py script. [Get Python](https://www.python.org/downloads/)
- **Git**: To clone the repository.

## How to Run the Project

Follow these steps to get the entire system running locally.

### Step 1: Clone the Repository

Clone this repository to your local machine:

```bash
git clone <repository_url>
cd virtual-fencing-system
```

### Step 2: Start the System

Open a terminal in the project's root directory (`virtual-fencing-system/`) and run the following command:

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for the backend and frontend services.
- Start the database, backend, and frontend containers.

The initial build might take a few minutes. You will see logs from all services streamed to your terminal.

### Step 3: Run the Data Simulator

While the main system is running, open a new, separate terminal window.

Navigate into the simulator directory and run the Python script:

```bash
# Navigate into the simulator directory
cd simulator

# Install the required Python packages
pip install -r requirements.txt

# Run the simulator script
python simulator.py
```

This script will start sending simulated cattle collar data to the backend API every 20 seconds. You will see log messages in this terminal indicating what data is being sent.

### Step 4: Use the Web Application

Open your web browser and go to:

```
http://localhost:8080
```

You should now see the application dashboard.

- **Drawing a Fence**: Use the polygon drawing tool on the left side of the map. Click on the map to create points. To finish, click on the first point you created. A "Save Fence" button will appear.
- **Viewing Cattle**: The Python simulator sends data for two simulated collars. Within 20 seconds of starting the simulator, you should see cow icons appear on the map. Their positions will update automatically as new data is received.
- **Viewing Cattle Data**: Click on any cow icon to see the latest data payload received for that specific collar.

## Stopping the System

To stop all running services, go to the first terminal (where you ran docker-compose) and press `Ctrl + C`.

To remove the containers and the database volume (deleting all data), you can run:

```bash
docker-compose down -v
```
