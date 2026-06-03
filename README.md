# 🇮🇳 Indian Manifesto Tracker

An AI-powered civic intelligence platform that tracks, analyzes, and evaluates political promises across Indian elections. The platform transforms manifesto documents into structured, searchable data and continuously monitors public evidence to assess promise fulfillment.

## 🚀 Overview

Indian Manifesto Tracker is a full-stack AI application designed to improve political transparency and accountability. The system ingests election manifestos, extracts promises using Large Language Models (LLMs), stores them in a structured database, and tracks their implementation status through news and public information sources.

Users can explore promises by political party, government, state, and category while interacting with an AI-powered assistant for natural language querying.

---

## ✨ Key Features

### 📜 Manifesto Intelligence

* Automated manifesto PDF ingestion
* AI-powered promise extraction
* Promise categorization and normalization
* Multi-party and multi-election support

### 🤖 AI-Powered Analysis

* LLM-based promise extraction pipeline
* Semantic search and retrieval
* Natural language Q&A chatbot
* Automated status classification

### 📊 Analytics Dashboard

* Party-wise performance tracking
* Promise fulfillment statistics
* State-level political insights
* Comparative political analysis

### 🗺️ Interactive Visualization

* Geographic promise tracking
* State-wise political commitments
* Regional analytics and filtering

### 🔍 Advanced Search

* Search promises by keyword
* Filter by party, state, category, and status
* AI-assisted discovery and exploration

---

## 🏗️ System Architecture

```text
Manifesto PDFs
      │
      ▼
PDF Extraction Pipeline
      │
      ▼
LLM Promise Extraction
      │
      ▼
Promise Database
      │
      ├─────────────► News Monitoring
      │                     │
      │                     ▼
      │              Status Classification
      │                     │
      ▼                     ▼
 REST API Layer      Evidence Repository
      │
      ▼
 React Frontend + AI Chat Assistant
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* Prisma ORM
* REST APIs

### Database

* PostgreSQL

### AI & Data Pipeline

* Python
* Large Language Models (LLMs)
* Prompt Engineering
* PDF Processing
* Automated Classification

### DevOps & Tools

* Git
* GitHub
* Postman

---

## 📂 Project Structure

```text
manifesto-tracker
│
├── frontend/          # React Frontend
├── backend/           # Node.js API Server
├── pipeline/          # AI Processing Pipeline
│
├── data/
├── docs/
└── README.md
```

---

## 📸 Screenshots

### Home Dashboard

![Dashboard](screenshots/dashboard.png)

### Promise Analytics

![Analytics](screenshots/analytics.png)

### AI Chat Assistant

![Chatbot](screenshots/chatbot.png)

### Interactive Map View

![Map](screenshots/mapview.png)

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Anupkumar-mishra/Manifesto-tracker.git
cd Manifesto-tracker
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Pipeline Setup

```bash
cd pipeline

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python main.py
```

---

## 🔑 Environment Variables

### Backend

```env
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
```

### Pipeline

```env
OPENAI_API_KEY=
DATABASE_URL=
```

---

## 📈 Current Capabilities

* Manifesto ingestion
* Promise extraction
* Promise database creation
* AI chatbot interaction
* Status classification
* Party comparison
* State-level analytics
* Evidence tracking

---

## 🎯 Future Roadmap

* Real-time news monitoring
* RAG-powered chatbot
* Multi-language manifesto support
* Election trend forecasting
* Mobile application
* Public API access
* Automated fact verification

---

## 🌟 Impact

Indian Manifesto Tracker aims to increase transparency in democratic governance by enabling citizens, journalists, researchers, and policymakers to track political commitments and evaluate government performance through data-driven insights.

---

## 👨‍💻 Author

**Anup Kumar Mishra**

* LinkedIn: https://linkedin.com/in/YOUR_LINKEDIN
* GitHub: https://github.com/Anupkumar-mishra

---

## 📄 License

This project is developed for educational, research, and civic technology purposes.
