// =================== script.js (base foundation) ===================

// Firebase imports
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

// ------------------ Detect current page ------------------
const currentPage = window.location.pathname.split("/").pop();
console.log(`📄 Loaded JS for: ${currentPage}`);

// ---------- Safe redirect helper ----------
let _isNavigating = false;
function safeRedirect(url) {
  if (_isNavigating) return;
  _isNavigating = true;

  setTimeout(() => {
    window.location.href = url;
  }, 100);
}

// ------------------- Helper utility -------------------
function showMessage(el, text, type = "success", autoHide = true, timeout = 4000) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`;
  el.style.display = "block";

  if (autoHide) {
    setTimeout(() => (el.style.display = "none"), timeout);
  }
}

/* ======================================================
   WELCOME PAGE (index.html)
====================================================== */
if (currentPage === "" || currentPage === "index.html") {
  console.log("✅ Welcome page loaded");

  const studentBtn = document.querySelector(".role-btn.student");
  const teacherBtn = document.querySelector(".role-btn.teacher");
  const adminBtn = document.querySelector(".role-btn.admin");
  const registerLink = document.getElementById("registerLink");

  if (studentBtn) studentBtn.onclick = () => safeRedirect("student-login.html");
  if (teacherBtn) teacherBtn.onclick = () => safeRedirect("teacher-login.html");

  if (adminBtn) {
    adminBtn.onclick = () => alert("🔒 Admin system under development.");
  }

  if (registerLink) {
    registerLink.onclick = (e) => {
      e.preventDefault();
      safeRedirect("student-signup.html");
    };
  }
}

/* ======================================================
   STUDENT LOGIN PAGE
====================================================== */
if (currentPage === "student-login.html") {
  console.log("✅ Student Login page loaded");

  const loginForm = document.getElementById("studentLoginForm");
  const errorMsg = document.getElementById("errorMsg");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        errorMsg.textContent = "⚠️ Please enter both email and password.";
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        errorMsg.style.color = "green";
        errorMsg.textContent = "Login successful! Redirecting...";

        setTimeout(() => safeRedirect("student-dashboard.html"), 900);
      } catch (error) {
        errorMsg.style.color = "red";
        if (error.code === "auth/user-not-found")
          errorMsg.textContent = "⚠️ No user with this email.";
        else if (error.code === "auth/wrong-password")
          errorMsg.textContent = "⚠️ Incorrect password.";
        else
          errorMsg.textContent = "⚠️ Login failed.";
      }
    });
  }
}

/* ======================================================
   STUDENT SIGNUP PAGE
====================================================== */
if (currentPage === "student-signup.html") {
  console.log("✅ Student Signup page loaded");

  const signupForm = document.getElementById("studentSignupForm");
  const formMessage = document.getElementById("formMessage");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const department = document.getElementById("department").value.trim();

      if (!name || !email || !password || !department) {
        showMessage(formMessage, "⚠️ All fields are required.", "error");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "students", user.uid), {
          name,
          email,
          department,
          createdAt: new Date(),
        });

        showMessage(formMessage, "✅ Registration successful! Redirecting...", "success");

        setTimeout(() => safeRedirect("student-login.html"), 1800);
      } catch (error) {
        if (error.code === "auth/email-already-in-use")
          showMessage(formMessage, "⚠️ Email already exists.", "error");
        else
          showMessage(formMessage, "⚠️ Signup failed.", "error");
      }
    });
  }
}

/* ======================================================
   STUDENT DASHBOARD PAGE
====================================================== */
if (currentPage === "student-dashboard.html") {
  console.log("✅ Student Dashboard loaded");

  const studentName = document.getElementById("studentName");
  const studentEmail = document.getElementById("studentEmail");
  const studentDept = document.getElementById("studentDept");
  const bookingForm = document.getElementById("appointmentForm");
  const bookingMsg = document.getElementById("bookingMsg");
  const logoutBtn = document.getElementById("logoutBtn");
  const myAppointmentsList = document.getElementById("myAppointmentsList");
  const messageForm = document.getElementById("messageForm");
  const messageStatus = document.getElementById("messageStatus");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return safeRedirect("student-login.html");

    try {
      const ref = doc(db, "students", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        studentName.textContent = data.name.split(" ")[0];
        studentEmail.textContent = data.email;
        studentDept.textContent = data.department;
      } else {
        studentName.textContent = user.email;
        studentEmail.textContent = user.email;
        studentDept.textContent = "N/A";
      }
    } catch (err) {
      studentName.textContent = "Student";
    }

    // Load appointments
    const all = await getDocs(collection(db, "appointments"));
    myAppointmentsList.innerHTML = "";

    let found = false;

    all.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.studentId === user.uid) {
        found = true;

        const div = document.createElement("div");
        div.className = "appointment-card";

        div.innerHTML = `
          <p><strong>Teacher:</strong> ${data.teacherName}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          ${data.status === "Pending" ? "<button class='cancel-btn'>Cancel</button>" : ""}
        `;

        const cancelBtn = div.querySelector(".cancel-btn");
        if (cancelBtn) {
          cancelBtn.onclick = async () => {
            await updateDoc(doc(db, "appointments", docSnap.id), { status: "Cancelled" });
            alert("❌ Appointment cancelled");
            location.reload();
          };
        }

        myAppointmentsList.appendChild(div);
      }
    });

    if (!found) myAppointmentsList.innerHTML = "<p>No appointments found.</p>";
  });

  // Booking form
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const teacherName = document.getElementById("teacherName").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const user = auth.currentUser;

      if (!teacherName || !subject || !date || !time) {
        bookingMsg.textContent = "⚠️ Fill all fields.";
        bookingMsg.style.color = "red";
        return;
      }

      await addDoc(collection(db, "appointments"), {
        studentId: user.uid,
        teacherName,
        subject,
        date,
        time,
        status: "Pending",
        bookedAt: new Date(),
      });

      bookingMsg.textContent = "✅ Appointment booked!";
      bookingMsg.style.color = "green";

      bookingForm.reset();
      setTimeout(() => (bookingMsg.textContent = ""), 2500);
    });
  }

  // Message form
  if (messageForm) {
    messageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const teacherEmail = document.getElementById("msgTeacherEmail").value.trim();
      const messageContent = document.getElementById("msgContent").value.trim();
      const user = auth.currentUser;

      if (!teacherEmail || !messageContent) {
        messageStatus.textContent = "⚠️ Fill all fields.";
        messageStatus.style.color = "red";
        return;
      }

      await addDoc(collection(db, "messages"), {
        senderId: user.email,
        receiverId: teacherEmail,
        message: messageContent,
        timestamp: new Date(),
      });

      messageStatus.textContent = "✅ Message sent!";
      messageStatus.style.color = "green";

      messageForm.reset();
      setTimeout(() => (messageStatus.textContent = ""), 2500);
    });
  }

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await signOut(auth);
      safeRedirect("student-login.html");
    };
  }
}

/* ======================================================
   TEACHER LOGIN PAGE
====================================================== */
if (currentPage === "teacher-login.html") {
  console.log("✅ Teacher Login page loaded");

  const form = document.getElementById("teacherLoginForm");
  const errorBox = document.getElementById("teacherError");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        errorBox.textContent = "⚠️ Fill all fields.";
        errorBox.style.color = "red";
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        errorBox.textContent = "Login successful!";
        errorBox.style.color = "green";

        setTimeout(() => safeRedirect("teacher-dashboard.html"), 900);
      } catch (err) {
        errorBox.textContent = "⚠️ Wrong email or password.";
        errorBox.style.color = "red";
      }
    });
  }
}

/* ======================================================
   TEACHER DASHBOARD PAGE
====================================================== */
if (currentPage === "teacher-dashboard.html") {
  console.log("📘 Teacher Dashboard page loaded");

  const tName = document.getElementById("teacherName");
  const tEmail = document.getElementById("teacherEmail");
  const tDept = document.getElementById("teacherDept");
  const list = document.getElementById("appointmentList");
  const messageList = document.getElementById("messageList");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return safeRedirect("teacher-login.html");

    const teacherEmail = user.email || "";
    tEmail.textContent = teacherEmail;

    try {
      // ✅ Fetch teacher info by email
      const q = query(collection(db, "teachers"), where("email", "==", teacherEmail));
      const snap = await getDocs(q);

      let teacherData = null;
      snap.forEach((docSnap) => {
        teacherData = docSnap.data();
        teacherData.id = docSnap.id;
      });

      if (teacherData) {
        tName.textContent = teacherData.name;
        tDept.textContent = teacherData.department;
      } else {
        tName.textContent = teacherEmail;
        tDept.textContent = "N/A";
      }

      // ✅ Load Appointments for this teacher
      list.innerHTML = "<p>Loading appointments...</p>";
      const appointmentsSnap = await getDocs(collection(db, "appointments"));
      list.innerHTML = "";
      let foundAppointments = false;

      appointmentsSnap.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.teacherName === teacherData?.name) {
          foundAppointments = true;
          const div = document.createElement("div");
          div.className = "appointment-card";

          div.innerHTML = `
            <h3>${data.subject}</h3>
            <p><strong>Student:</strong> ${data.studentName || data.studentId}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <div class="action-buttons">
              <button class="approve-btn">Approve</button>
              <button class="reject-btn">Reject</button>
            </div>
          `;

          div.querySelector(".approve-btn").onclick = async () => {
            await updateDoc(doc(db, "appointments", docSnap.id), { status: "Approved" });
            alert("✅ Appointment Approved!");
            location.reload();
          };

          div.querySelector(".reject-btn").onclick = async () => {
            await updateDoc(doc(db, "appointments", docSnap.id), { status: "Rejected" });
            alert("❌ Appointment Rejected!");
            location.reload();
          };

          list.appendChild(div);
        }
      });

      if (!foundAppointments) list.innerHTML = "<p>No appointments found for you.</p>";

      // ✅ Load Messages for this teacher
      messageList.innerHTML = "<p>Loading messages...</p>";
      const msgQuery = query(collection(db, "messages"), where("receiverId", "==", teacherEmail));
      const msgSnap = await getDocs(msgQuery);
      messageList.innerHTML = "";
      let foundMessages = false;

      msgSnap.forEach((msgDoc) => {
        const msg = msgDoc.data();
        foundMessages = true;

        const div = document.createElement("div");
        div.className = "message-card";
        div.innerHTML = `
          <p><strong>From:</strong> ${msg.senderId}</p></br>
          <p><strong>Message:</strong><em>${msg.message}</em></p>
          <p class="timestamp">${new Date(msg.timestamp.seconds * 1000).toLocaleString()}</p>
        `;

        messageList.appendChild(div);
      });

      if (!foundMessages) messageList.innerHTML = "<p>No messages received yet.</p>";

    } catch (err) {
      console.error("🔥 Error loading teacher dashboard:", err);
      tName.textContent = "Error loading teacher info";
      tDept.textContent = "N/A";
      messageList.innerHTML = "<p>Error loading messages.</p>";
    }
  });

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await signOut(auth);
      safeRedirect("teacher-login.html");
    };
  }
}

// =================== Admin Login Page ===================

if (currentPage === "admin-login.html") {
  console.log("🔐 Admin Login JS Loaded");

  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminError = document.getElementById("adminError");

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("adminEmail").value.trim();
      const password = document.getElementById("adminPassword").value.trim();

      if (!email || !password) {
        adminError.textContent = "⚠️ Please fill all fields.";
        return;
      }

      try {
        // Login using Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("✅ Admin logged in:", user.email);

        // Check if this is an admin account in Firestore
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          adminError.textContent = "⚠️ You are not authorized as admin.";
          await signOut(auth);
          return;
        }

        adminError.style.color = "green";
        adminError.textContent = "Login successful! Redirecting...";

        setTimeout(() => {
          safeRedirect("admin-dashboard.html");
        }, 800);

      } catch (error) {
        console.error("❌ Admin login error:", error.message);
        adminError.textContent = "⚠️ Invalid email or password.";
        adminError.style.color = "red";
      }
    });
  }
}

// =================== ADMIN DASHBOARD SCRIPT ===================
if (currentPage === "admin-dashboard.html") {
  console.log("✅ Admin Dashboard Loaded");

  const logoutBtn = document.getElementById("logoutBtn");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  // -------- TAB SWITCHING --------
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // -------- AUTH CHECK --------
  onAuthStateChanged(auth, async (user) => {
    if (!user) return safeRedirect("admin-login.html");

    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnap.exists()) {
      alert("You are not authorized as admin!");
      await signOut(auth);
      safeRedirect("admin-login.html");
    }
  });

  // -------- TEACHERS --------
  const addTeacherForm = document.getElementById("addTeacherForm");
  const addTeacherMsg = document.getElementById("addTeacherMsg");
  const teachersList = document.getElementById("teachersList");
  const refreshTeachers = document.getElementById("refreshTeachers");

  async function loadTeachers() {
    const qs = await getDocs(collection(db, "teachers"));
    if (qs.empty) {
      teachersList.innerHTML = "<p>No teachers yet.</p>";
      return;
    }
    let rows = "";
    qs.forEach(docSnap => {
      const t = docSnap.data();
      rows += `<tr>
          <td>${t.name}</td>
          <td>${t.email}</td>
          <td>${t.department}</td>
          <td>${t.subject}</td>
        </tr>`;
    });
    teachersList.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Subject</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  addTeacherForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = tName.value.trim();
    const email = tEmail.value.trim();
    const department = tDept.value.trim();
    const subject = tSubject.value.trim();

    if (!name || !email || !department || !subject) {
      addTeacherMsg.textContent = "⚠️ Fill all fields.";
      addTeacherMsg.className = "form-message error";
      return;
    }

    await addDoc(collection(db, "teachers"), {
      name, email, department, subject, createdAt: new Date()
    });

    await addDoc(collection(db, "logs"), {
      action: "Added Teacher",
      details: `${name} (${email}) - ${department}`,
      performedBy: "admin",
      timestamp: new Date()
    });

    addTeacherMsg.textContent = "✅ Teacher added successfully!";
    addTeacherMsg.className = "form-message success";
    addTeacherForm.reset();
    loadTeachers();
  });

  refreshTeachers.addEventListener("click", loadTeachers);
  loadTeachers();

  // -------- STUDENTS --------
  const refreshStudents = document.getElementById("refreshStudents");
  const allStudentsList = document.getElementById("allStudentsList");

  async function loadStudents() {
    const qs = await getDocs(collection(db, "students"));
    if (qs.empty) {
      allStudentsList.innerHTML = "<p>No students found.</p>";
      return;
    }
    let rows = "";
    qs.forEach(d => {
      const s = d.data();
      rows += `<tr>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.department}</td>
        <td>${new Date(s.createdAt.seconds * 1000).toLocaleDateString()}</td>
      </tr>`;
    });
    allStudentsList.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Registered</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  refreshStudents.addEventListener("click", loadStudents);

  // -------- APPOINTMENTS --------
  const refreshAppointments = document.getElementById("refreshAppointments");
  const allAppointmentsList = document.getElementById("allAppointmentsList");

  async function loadAppointments() {
    const qs = await getDocs(collection(db, "appointments"));
    if (qs.empty) {
      allAppointmentsList.innerHTML = "<p>No appointments found.</p>";
      return;
    }
    let rows = "";
    qs.forEach(d => {
      const a = d.data();
      rows += `<tr>
        <td>${a.teacherName}</td>
        <td>${a.subject}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td>${a.status}</td>
      </tr>`;
    });
    allAppointmentsList.innerHTML = `
      <table>
        <thead><tr><th>Teacher</th><th>Subject</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  refreshAppointments.addEventListener("click", loadAppointments);

  // -------- MESSAGES --------
  const refreshMessages = document.getElementById("refreshMessages");
  const messagesList = document.getElementById("messagesList");

  async function loadMessages() {
    const qs = await getDocs(collection(db, "messages"));
    if (qs.empty) {
      messagesList.innerHTML = "<p>No messages found.</p>";
      return;
    }
    let content = "";
    qs.forEach(d => {
      const m = d.data();
      content += `
        <div class="message-card">
          <p><strong>From:</strong> ${m.senderId}</p>
          <p><strong>To:</strong> ${m.receiverId}</p>
          <p><em>${m.message}</em></p>
          <p class="timestamp">${new Date(m.timestamp.seconds * 1000).toLocaleString()}</p>
        </div>`;
    });
    messagesList.innerHTML = content;
  }

  refreshMessages.addEventListener("click", loadMessages);

  // -------- LOGS --------
  const refreshLogs = document.getElementById("refreshLogs");
  const logsList = document.getElementById("logsList");

  async function loadLogs() {
    const qs = await getDocs(collection(db, "logs"));
    if (qs.empty) {
      logsList.innerHTML = "<p>No logs yet.</p>";
      return;
    }
    let rows = "";
    qs.forEach(d => {
      const l = d.data();
      rows += `<tr>
        <td>${l.action}</td>
        <td>${l.details}</td>
        <td>${new Date(l.timestamp.seconds * 1000).toLocaleString()}</td>
      </tr>`;
    });
    logsList.innerHTML = `
      <table>
        <thead><tr><th>Action</th><th>Details</th><th>Timestamp</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  refreshLogs.addEventListener("click", loadLogs);

  // -------- LOGOUT --------
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    safeRedirect("admin-login.html");
  });
}