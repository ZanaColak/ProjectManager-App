# Project Manager App

## Overview
The **Project Manager App** helps you manage projects, tasks, teams, and timelines in one place. Whether you're working solo on a personal project or leading a team, this app makes it easy to track progress and stay organized.

**Live Demo**: [https://project-manager-x4m5.onrender.com](https://project-manager-x4m5.onrender.com)  
*(Note: The live version is currently not working, but follow the steps below to run it locally.)*

## Features

### Key Features:
- **Project Management**: Create, edit, and delete projects. Track important details such as start dates, deadlines, and descriptions.
- **Task Management**: Break down projects into tasks and subtasks. Assign tasks to team members and track progress.
- **Team Management**: Add, remove, and manage team members. Assign roles (Admin or Member) and keep team details up to date.
- **Timeline View**: Visualize project and task timelines with an interactive, easy-to-read view.

### Roles:
- **Admin**: Full access to create, edit, and delete projects, tasks, and manage teams.
- **Member**: Limited access to view and update only the tasks assigned to them.

## Pages Overview

### **Login / Signup**:
- On the homepage, log in with your email and password, or sign up as a new user.

### **Dashboard**:
- After logging in, you will be directed to the dashboard, where you can:
  - Manage Projects (Admins only)
  - View Calendar (See all events and project timelines)
  - Manage Team Members
  - Access Scrum Board (A Kanban-style board for tasks)

### **Projects**:
- Create new projects with details like title, description, start date, and deadline.
- Admin users can edit or delete projects.

### **Tasks**:
- Add, edit, and delete tasks within projects.
- Break tasks into smaller **subtasks**, assign them to team members, and track their completion.

### **Teams**:
- Add and manage team members, assign them roles, and link them to departments.

### **Timeline**:
- Visualize your project and task timelines with interactive filters for projects, tasks, and team members.

## Tables

### **Projects Table**:
| Project Title | Start Date | Deadline | Final Date | Estimated Time | Actual Time | Time Evaluation |
|---------------|------------|----------|------------|----------------|-------------|-----------------|

### **Tasks Table**:
| Task Title    | Description         |
|---------------|---------------------|

### **Subtasks Table**:
| Subtask Title | Description         | Estimated Time | Actual Time | Assigned Employees |
|---------------|---------------------|----------------|-------------|--------------------|

### **Team Table**:
| First Name  | Last Name  | Email          | Role  | Departments      |
|-------------|------------|----------------|-------|------------------|

---

## Getting Started (Run Locally)

Welcome! 🚀 Let’s get the **Project Manager App** running on your local machine. Just follow these steps:

### Prerequisites:
Before we begin, ensure you have the following tools set up:
1. **Node.js** and **npm** (Node Package Manager) installed on your system.
2. **Firebase** project set up for authentication and database management.
3. For mobile app testing, install **React Native CLI**.

### Installation Steps:

#### 1. Clone the Repository:
First, clone the repo to your local machine:

git clone https://github.com/ZanaColak/ProjectManager-App.git
cd ProjectManager-App

2. Install Dependencies:
Next, install all required dependencies for the app:
npm install

3. Set Up Firebase:
Follow the Firebase documentation to create a Firebase project for authentication and database. Connect your Firebase project to the app by adding your Firebase configuration into the app's setup.

4. Run the App:
For the Web Version:
To run the app on your browser:

npm start
This will start the app at http://localhost:3000, and you’ll be able to see it in your browser. 🌐

For React Native (Mobile Version):
If you want to test the mobile version of the app on an emulator or real device, use the following commands:

For iOS:
npx react-native run-ios

For Android:
npx react-native run-android
Ensure your emulator is running, or connect a physical device via USB. The app will launch on your device. 📱
