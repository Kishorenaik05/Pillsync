PillSync – Intelligent Medicine Reminder & Medication Tracking Platform

Project Overview

PillSync is a full-stack healthcare web application developed to help patients, caregivers, and administrators manage medication-related information efficiently. The platform provides secure authentication, role-based access control, user profile management, and a foundation for future medication reminder and tracking features.

This repository contains Milestone 1 of the PillSync project.

Project Objectives

• Design a healthcare workflow management system.
• Implement secure user authentication and authorization.
• Create a PostgreSQL database for user and profile management.
• Develop a responsive frontend and backend architecture.
• Build user profile management functionality.
• Establish a scalable foundation for future medication reminder features.

Milestone 1 Features

• User Registration
• User Login
• JWT Authentication
• Password Encryption using bcrypt
• Role-Based Access Control
• User Profile Management
• PostgreSQL Database Integration
• React Frontend Setup
• Node.js and Express Backend Setup

User Roles

Patient

Manage personal profile information.
Access patient dashboard.

Caregiver

Access caregiver dashboard features.
Manage assigned patient information.

Admin

Manage system users.
Access administrative functions.

Technology Stack

Frontend:

React.js
React Router DOM
Axios
CSS

Backend:

Node.js
Express.js
JWT Authentication
bcrypt

Database:

PostgreSQL

Version Control:

Git
GitHub

Project Structure

PillSync

frontend

src
pages
components

backend

config
controllers
middleware
models
routes

database

schema.sql

README.md

Database Design

Users Table

Fields:

id
full_name
email
password
role
phone
created_at

Profiles Table

Fields:

id
user_id
age
gender
address
emergency_contact

Authentication and Security

• JWT-based Authentication
• Password Hashing with bcrypt
• Protected Routes
• Role-Based Authorization
• Input Validation
• Error Handling
• Secure API Access

API Endpoints

Authentication

POST /api/auth/register
Register a new user.

POST /api/auth/login
Login and receive JWT token.

Profile

GET /api/profile
Retrieve logged-in user profile.

PUT /api/profile
Update user profile information.

Admin

GET /api/admin
Admin-only protected route.

Installation Steps

Clone the repository.

git clone https://github.com/your-username/PillSync.git

Frontend Setup

cd frontend

npm install

npm run dev

Backend Setup

cd backend

npm install

npm run dev

PostgreSQL Setup

Create a database named:

pillsync

Execute the schema.sql file to create required tables.

Environment Variables

PORT=5000

JWT_SECRET=your_secret_key

DB_HOST=localhost

DB_PORT=5432

DB_USER=postgres

DB_PASSWORD=your_password

DB_NAME=pillsync

Screenshots to Include

• Login Page
• Registration Page
• Dashboard Page
• Profile Page
• PostgreSQL Database Tables

Learning Outcomes

• Healthcare Workflow Management
• Database Design and Architecture
• Full Stack Development
• Authentication and Authorization
• PostgreSQL Integration
• REST API Development

Milestone 1 Completion Status

Completed:

Project Scope Definition
Database Schema Design
UI Wireframes
Frontend Setup
Backend Setup
Authentication System
Role-Based Access Control
PostgreSQL Configuration
User Profile Management

Developer Information

Name: Kishore Naik

Course: B.Tech Data Science

Project Title: PillSync – Intelligent Medicine Reminder & Medication Tracking Platform

Purpose

This project is developed for educational, academic, and learning purposes as part of the PillSync development roadmap.
