AI-Based Citizen Grievance Redressal System

A multilingual AI-powered civic grievance intelligence platform capable of understanding noisy real-world complaints across multiple Indian languages and automatically classifying them into government departments with urgency detection, sentiment analysis, privacy protection, and governance-focused summarization.

Overview

This project is designed as an intelligent governance AI system for smart civic complaint management.

The platform uses multilingual transformer-based NLP models to process real-world complaints written in:

English
Hindi
Hinglish
Bengali
Marathi
Tamil

The AI system can also demonstrate partial cross-lingual generalization for languages not explicitly present in the dataset.

Core Features
Multilingual Complaint Understanding

The AI can understand noisy multilingual complaints involving:

Hinglish
Mixed-language complaints
Typographical errors
Short emergency complaints
SMS-style text
Emotion-heavy complaints
Contextual civic issues

Example:

HELP!! bijli ka taar spark kar raha hai
AI Department Classification

The transformer model automatically predicts the correct civic department.

Supported Departments
Department
Electricity
Roads & Traffic
Water Supply
Sanitation & Waste
Public Parks & Infrastructure
AI Priority Detection

The platform automatically detects urgency levels.

Priority Levels
Priority
Low
Medium
High
Critical
Example Intelligence
Complaint	Predicted Priority
Transformer blast near school	Critical
Current leakage from pole	Critical
Large pothole causing accidents	High
Water supply issue	Medium
Broken park bench	Low
AI Sentiment Intelligence

The system detects complaint tone and emotional context.

Supported Sentiments
Sentiment
Neutral
Pleading
Angry
Panic
Example
HELP!! transformer blast ho gaya

Predicted Sentiment:

Panic
Multilingual PII Redaction

The platform automatically masks sensitive personal information before processing complaints.

Supported PII Detection
Phone Numbers
Email Addresses
Aadhaar Numbers
URLs
Names
Multilingual Name Detection

Supported across:

English
Hinglish
Hindi
Bengali
Tamil
Marathi
Example

Input:

Mera naam Sahil hai aur mera number 9876543210 hai

Output:

Mera naam [NAME REDACTED] aur mera number [PHONE REDACTED] hai
Governance Summary Generation

The system generates concise governance-friendly summaries for dashboards and administrators.

Example

Input:

HELP!! bijli ka taar spark kar raha hai bachche bahar khel rahe hain

Generated Summary:

Electrical safety issue reported involving possible power infrastructure risk.
AI Model Used
Base Transformer
distilbert-base-multilingual-cased
Capabilities
Multilingual embeddings
Cross-lingual transfer learning
Semantic understanding
Multilingual tokenization
Noisy text understanding
Context-aware classification
Dataset Engineering

A custom multilingual civic grievance dataset was engineered specifically for transformer fine-tuning.

Dataset Specifications
Feature	Value
Total Rows	2500+
Languages	6
Complaint Types	Realistic civic complaints
Edge Cases	Included
Typo Injection	Included
Hinglish	Included
SMS-style Complaints	Included
Emergency Complaints	Included
Adversarial Structures	Included
Edge Cases Successfully Solved
Complaint	Prediction
transformer blast ho gaya	Electricity
bijli ka taar spark kar raha hai	Electricity
gaddha	Roads & Traffic
signal dead	Roads & Traffic
current leak	Electricity
FastAPI AI Microservice

The AI engine is deployed using FastAPI for real-time inference.

Features
REST API
Real-time prediction
GPU acceleration
Swagger API testing
Modular AI architecture
Secure complaint processing
Swagger API Documentation
http://127.0.0.1:8001/docs
Example API Request
{
  "text": "HELP!! bijli ka taar spark kar raha hai bachche bahar khel rahe hain jaldi aao"
}
Example API Response
{
  "complaint": "HELP!! bijli ka taar spark kar raha hai bachche bahar khel rahe hain jaldi aao",
  "prediction": {
    "department": "Electricity",
    "priority": "Critical",
    "sentiment": "Panic",
    "summary": "Electrical safety issue reported involving possible power infrastructure risk.",
    "confidence": 0.8713
  }
}
System Architecture
React Frontend
        ↓
Django Backend
        ↓
FastAPI AI Engine
        ↓
Multilingual Transformer Model
Project Structure
citizen-grievance-system/
│
├── frontend/              # React + Vite Frontend
│
├── backend/               # Django Backend
│
├── ai_engine/             # FastAPI AI Engine
│   ├── src/
│   │   ├── classifier.py
│   │   ├── predict.py
│   │   ├── priority_logic.py
│   │   ├── sentiment_logic.py
│   │   ├── pii_redaction.py
│   │   ├── summarizer.py
│   │
│   └── models/
│
└── README.md
Running the Project
1. Activate Conda Environment
conda activate grievance_ai
Frontend Server (React + Vite)
Navigate to Frontend
cd ~/Projects/Sahayak_AI/citizen-grievance-system/frontend
Start Frontend Server
npm run dev
Frontend URL
http://localhost:5173
Backend Server (Django)
Navigate to Backend
cd ~/Projects/Sahayak_AI/citizen-grievance-system/backend
Start Django Server
python manage.py runserver
Backend URL
http://127.0.0.1:8000
AI Engine Server (FastAPI)
Navigate to AI Engine
cd ~/Projects/Sahayak_AI/citizen-grievance-system/ai_engine
Start FastAPI Server
uvicorn main:app --reload --port 8001
AI Engine URL
http://127.0.0.1:8001
Swagger API Documentation
http://127.0.0.1:8001/docs
Active Ports
Service	Port
Frontend	5173
Backend	8000
AI Engine	8001
AI Capabilities

The platform can:

Understand multilingual complaints
Detect urgency and emergency situations
Process Hinglish and noisy text
Handle short civic complaints
Detect emotional complaint tone
Redact sensitive information
Generate governance-friendly summaries
Perform contextual classification
Process adversarial edge cases
Support cross-lingual semantic understanding
Current Project Status
Completed
Project architecture setup
React frontend setup
Django backend setup
FastAPI AI microservice
Transformer model training
Multilingual dataset engineering
Department classification
Priority detection
Sentiment analysis
PII redaction
Governance summarization
Swagger API integration
GPU inference support
Cross-lingual testing
Edge-case robustness improvements
Upcoming Phases
Backend Integrations
Django ↔ FastAPI integration
MongoDB complaint storage
Authentication system
Complaint history APIs
AI Enhancements
OCR-based complaint extraction
Voice complaint support
Speech-to-text pipeline
Advanced multilingual expansion
Real-time analytics engine
Dashboard & Visualization
Real-time civic dashboard
Heatmaps
Complaint analytics
Department monitoring
Complaint tracking system
Admin control panel
Tech Stack
Layer	Technology
Frontend	React + Vite
Backend	Django
AI Engine	FastAPI
NLP	Hugging Face Transformers
Deep Learning	PyTorch
Model	DistilBERT Multilingual
Language Support	Multilingual NLP
Deployment	GPU Accelerated
Research & Engineering Highlights
Multilingual transformer fine-tuning
Adversarial civic dataset engineering
Cross-lingual transfer learning
Real-world noisy text handling
Governance-oriented NLP architecture
Privacy-preserving AI pipeline
Hybrid AI + rule-based civic intelligence
Current Development Stage
Phase 1  → Project Foundation           Completed
Phase 2  → AI Intelligence Engine       Completed
Phase 3  → Backend Integration          In Progress
Phase 4  → Dashboard & Analytics        Planned
Phase 5  → Deployment & Scaling         Planned