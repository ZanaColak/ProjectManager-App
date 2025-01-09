# Project Manager Application

## Overview
This Project Manager App is designed to streamline project management by providing an intuitive interface for managing projects, tasks, teams, and timelines. It enables users to organize workflows effectively and track project progress effortlessly.

**Live Application**: [https://project-manager-x4m5.onrender.com](https://project-manager-x4m5.onrender.com)  
_Note: The live version is currently not working. Follow the **CONTRIBUTE** section for a working local version._

## Features
### Core Functionalities
- **Project Management**: Create, edit, and delete projects with detailed descriptions, start dates, and deadlines.
- **Task Management**: Manage tasks and subtasks within projects, assign employees, and track progress.
- **Team Management**: View team members, add new users, assign roles, and manage employee details.
- **Timeline View**: Visualize project and task durations on an interactive timeline.

### Roles
- **Admin**: Full control over creating, editing, and deleting projects, tasks, and teams.
- **Member**: Limited access to view and update tasks assigned to them.

## Key Endpoints
The app includes multiple endpoints to access its features:
- `/login` - Login page for user authentication.
- `/signup` - Sign up new users.
- `/dashboard` - Main dashboard displaying projects and options for navigation.
- `/create_project` - Page to create new projects.

## Pages Overview
### **Homepage**
- Users are greeted with a login page where they can either log in or sign up.
- **Login** requires email and password.
- **Signup** requires first name, last name, email, and password.

### **Dashboard**
After login, users are directed to the dashboard with the following options:
1. **Projects**: Access all projects and perform CRUD operations (Admins only).
2. **Calendar**: View events and timelines for ongoing projects.
3. **Team**: Manage team members and roles.
4. **Scrum Board**: Organize tasks in a Kanban-style board.

### **Projects**
- Users can create new projects with title, description, start date, and deadline.
- Projects are displayed in a list with options for editing or deleting (Admins only).

### **Tasks**
- Add, edit, and delete tasks within specific projects.
- Subtasks allow users to break tasks into manageable units, assign employees, and mark them as completed.

### **Teams**
- Add and manage team members.
- Assign roles (Admin or Member) and associate users with departments.

### **Timeline**
- Interactive timeline to visualize project and task progress.
- Filters for projects, tasks, and team members.

## Table Views
### **Projects**
| Project Title | Start Date | Deadline | Final Date | Estimated Time | Actual Time | Time Evaluation |
|---------------|------------|----------|------------|----------------|-------------|-----------------|

### **Tasks**
| Task Title    | Description         |
|---------------|---------------------|

### **Subtasks**
| Subtask Title | Description         | Estimated Time | Actual Time | Assigned Employees |
|---------------|---------------------|----------------|-------------|--------------------|

### **Team**
| First Name  | Last Name  | Email          | Role  | Departments      |
|-------------|------------|----------------|-------|------------------|

## Installation & Setup
### Prerequisites
1. Node.js and npm installed on your local machine.
2. Firebase project setup (database and authentication).
3. React Native CLI installed for mobile development.

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/ZanaColak/ProjectManager-App.git
   cd ProjectManager-App
