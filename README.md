# Library Management System

This document helps HR reviewers or non-technical reviewers to:
- Understand the project quickly
- Clone the source code
- Run and test the project locally (backend + frontend + database)

## 1) Project Overview

The project has 2 main parts:
- Backend: Spring Boot (Java 17, Maven, PostgreSQL)
- Frontend: React + TypeScript + Vite

## 2) Folder Structure

```text
web_app_java/
  Backend/webapp/      # Spring Boot API
  frontend/            # React application
  db.sql               # Database schema/data script
```

## 3) Prerequisites

Please install:
- Git
- Java 17
- Node.js 18+ (Node.js 20 LTS recommended)
- PostgreSQL 15+ (or Docker)

Quick version check:

```powershell
git --version
java -version
node -v
npm -v
psql --version
```

## 4) Clone the Project

### Option 1: Clone via HTTPS

```powershell
git clone https://github.com/BanhNhatKhang/library_management_system.git
cd library_management_system/library/web_app_java
```

### Option 2: Download ZIP

1. Open the project GitHub page
2. Click Code -> Download ZIP
3. Extract and open the folder library/web_app_java

## 5) Database Setup (PostgreSQL)

Default database configuration:
- Host: localhost
- Port: 5432
- Database: CT466

### 5.1 Create database

```sql
CREATE DATABASE "CT466";
```

### 5.2 Import db.sql

Run from web_app_java directory:

```powershell
psql -U postgres -d CT466 -f db.sql
```

If your PostgreSQL user has a password, you will be prompted to enter it.

## 6) Backend Configuration

### 6.1 Create local config file

In Backend/webapp/src/main/resources:
1. Copy application.example.properties
2. Rename the copy to application.properties

### 6.2 Update DB credentials

Edit application.properties:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/CT466
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

## 7) Run Backend

From Backend/webapp:

```powershell
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Backend runs at:
- http://localhost:8080

## 8) Run Frontend

Open a new terminal, then from frontend:

```powershell
npm install
npm run dev
```

Frontend runs at:
- http://localhost:5173

Frontend calls backend API at:
- http://localhost:8080

## 9) Quick HR Test Checklist

After backend and frontend are running:
1. Open http://localhost:5173
2. Check that login/home page is displayed
3. Try registering a new account (if registration is enabled)
4. Try logging in and navigating key pages
5. If admin role is available, open admin pages and verify basic actions

## 10) Optional: Run PostgreSQL with Docker

There is a sample file: Backend/webapp/compose.example.yaml.

To run PostgreSQL in Docker:
1. Copy compose.example.yaml to compose.yaml
2. Update these values:
   - POSTGRES_DB
   - POSTGRES_USER
   - POSTGRES_PASSWORD
3. Run:

```powershell
cd Backend/webapp
docker compose up -d db
```

Then update application.properties with the same database credentials.

## 11) Common Issues

Database connection error:
- Make sure PostgreSQL is running
- Make sure CT466 exists
- Check username/password in application.properties

Frontend cannot call API:
- Make sure backend is running on port 8080
- Check API base URL in frontend/axiosConfig.ts

Clear dependency cache (if needed):

```powershell
# Frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Backend
cd Backend/webapp
.\mvnw.cmd clean
```
