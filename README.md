# 🎓 Student–Teacher Booking Appointment System

### 🧠 Domain: Education  
**Technologies:** HTML, CSS, JavaScript, Firebase  
**Difficulty Level:** Easy  

---

## 🚀 Overview
The **Student–Teacher Booking Appointment System** is a web-based platform designed to simplify communication between students and teachers.  
It allows students to book appointments, send messages, and check their meeting status while teachers can manage appointments, approve/reject requests, and view messages — all through a clean, responsive interface.

---

## ✨ Features

### 👨‍💼 Admin Panel
- Add Teacher (Name, Email, Department, Subject)
- View Teachers, Students, Appointments, Messages, and Logs
- Auto-logs all admin actions in the Firestore `logs` collection
- Logout functionality with Firebase Authentication

### 👩‍🏫 Teacher Panel
- Secure Login via Firebase Authentication
- View Profile (Name, Email, Department)
- View and Approve/Reject Appointments
- View Messages sent by Students
- Logout securely

### 👨‍🎓 Student Panel
- Register & Login using Firebase Authentication
- Search Teachers and Book Appointments
- Cancel Pending Appointments
- Send Messages to Teachers
- Logout securely

---

## 🧩 Firebase Collections

| Collection | Description |
|-------------|-------------|
| `admins` | Stores admin user details |
| `teachers` | Teacher info (name, email, department, subject) |
| `students` | Student registration data |
| `appointments` | All booked appointments |
| `messages` | Messages between students and teachers |
| `logs` | Activity logs for system tracking |

---

## 🧱 System Architecture

**Frontend:** HTML, CSS, JavaScript  
**Backend (BaaS):** Firebase (Authentication + Firestore Database)  
**Hosting (Optional):** Firebase Hosting  

**Architecture Flow:**
1. Admin manages teacher records and views system logs.  
2. Students login/register → book appointments with teachers → send messages.  
3. Teachers login → see their appointments → approve/reject → view student messages.  
4. All interactions are stored in Firebase Firestore for real-time access.

---

## 🧮 Low-Level Design (LLD)

### Entities:
- **Admin**
  - Attributes: uid, name, email
  - Functions: addTeacher(), viewLogs(), viewAppointments()
- **Teacher**
  - Attributes: name, email, department, subject
  - Functions: approveAppointment(), rejectAppointment(), viewMessages()
- **Student**
  - Attributes: name, email, department
  - Functions: bookAppointment(), cancelAppointment(), sendMessage()

### Workflows:
**1️⃣ Student Booking Flow:**
Student Login → Select Teacher → Enter Subject, Date, Time → Book Appointment  
→ Stored in Firestore (appointments collection)

**2️⃣ Teacher Approval Flow:**
Teacher Login → View Appointments → Approve / Reject  
→ Firestore 'appointments' collection updates status

**3️⃣ Message Flow:**
Student → Sends Message → Stored in 'messages' collection with sender & receiver  
Teacher → Views messages from 'messages' collection by receiverId (email)

**4️⃣ Admin Management Flow:**
Admin Login → Add Teacher (Firestore 'teachers') → Log action ('logs' collection)  
→ View Students, Appointments, and Messages

---

## 📊 Optimization Highlights
- Real-time database queries filtered by email/UID.
- Clean modular JavaScript structure.
- Page-level logic separation using `currentPage` detection.
- Lightweight front-end (no external JS frameworks).

---

## 📦 Deployment (Optional)
To host the app using **Firebase Hosting**:
```bash
firebase login
firebase init
firebase deploy
```

---

## 👏 Contributor
- **Soham Sumant Aeer**

---

## 🏁 Conclusion
This project fulfills all system modules defined in the document:  
✅ Admin Control  
✅ Teacher Management  
✅ Student Booking  
✅ Messaging System  
✅ Logging  
✅ Firebase Integration  

The system is fully functional, modular, and deployment-ready.
