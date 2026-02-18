const loginform = document.getElementById("loginform");

loginform.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }
  if (username === "chris" && password === "chris123") {
    window.location.href = "adminDashboard.html";
    loadOrders();
    setupCharts();
  } else {
    console.log("Failed to login");
    alert("Invalid credentials");
  }
});

// Form submission handling
// document
//   .getElementById("loginForm")
//   .addEventListener("submit", async function (e) {
//     e.preventDefault();

//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value.trim();

//     if (!email || !password) {
//       alert("Please fill in all fields");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "/login",
//         { email, password },
//         {
//           headers: { "Content-Type": "application/json" },
//         },
//       );

//       // Save token & user
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("currentUser", JSON.stringify(res.data.user));

//       alert("Login successful ");
//       window.location.href = "dashboard.html";
//     } catch (err) {
//       console.error("Login failed:", err.response?.data);
//       alert(err.response?.data?.message || "Login failed");
//     }
//   });
// // Forgot password link
// document
//   .querySelector(".forgot-password")
//   .addEventListener("click", function (e) {
//     e.preventDefault();
//     const email = prompt(
//       "Please enter your email address to reset your password:",
//     );
//     if (email) {
//       alert(
//         `Password reset instructions have been sent to ${email}. Please check your inbox.`,
//       );
//     }
//   });

// // Social login icons click handlers
// document.querySelectorAll(".social-icon").forEach((icon) => {
//   icon.addEventListener("click", function () {
//     const platform = this.querySelector("i")
//       .className.split(" ")[1]
//       .split("-")[1];
//     alert(`Redirecting to ${platform} login...`);
//   });
// });
// // Mobile menu toggle
// const menuToggle = document.getElementById("menuToggle");
// const navbar = document.getElementById("navbar");

// menuToggle.addEventListener("click", () => {
//   navbar.classList.toggle("active");
// });
