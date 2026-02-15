// DOM elements
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const username = document.getElementById("username");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const submitBtn = document.getElementById("submitBtn");

// Error message elements
const emailError = document.getElementById("email-error");
const phoneError = document.getElementById("phone-error");
const passwordError = document.getElementById("password-error");
const confirmPasswordError = document.getElementById("confirmPassword-error");

// Password strength elements
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 11;
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function checkPasswordStrength(password) {
  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[@$!%*?&]/.test(password)) strength += 1;

  // Determine strength level
  let strengthPercent = 0;
  let strengthLabel = "";

  if (strength <= 2) {
    strengthPercent = 25;
    strengthLabel = "Very Weak";
    strengthFill.style.backgroundColor = "#e74c3c";
  } else if (strength <= 4) {
    strengthPercent = 50;
    strengthLabel = "Weak";
    strengthFill.style.backgroundColor = "#f39c12";
  } else if (strength <= 5) {
    strengthPercent = 75;
    strengthLabel = "Good";
    strengthFill.style.backgroundColor = "#3498db";
  } else {
    strengthPercent = 100;
    strengthLabel = "Strong";
    strengthFill.style.backgroundColor = "#27ae60";
  }

  strengthFill.style.width = strengthPercent + "%";
  strengthText.textContent = "Password strength: " + strengthLabel;
}

// Toggle password visibility
togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  this.innerHTML =
    type === "password"
      ? '<i class="fas fa-eye"></i>'
      : '<i class="fas fa-eye-slash"></i>';
});

toggleConfirmPassword.addEventListener("click", function () {
  const type =
    confirmPasswordInput.getAttribute("type") === "password"
      ? "text"
      : "password";
  confirmPasswordInput.setAttribute("type", type);
  this.innerHTML =
    type === "password"
      ? '<i class="fas fa-eye"></i>'
      : '<i class="fas fa-eye-slash"></i>';
});

// Real-time validation
emailInput.addEventListener("input", function () {
  const isValid = validateEmail(this.value);

  if (this.value === "") {
    this.classList.remove("valid", "invalid");
    emailError.style.display = "none";
  } else if (isValid) {
    this.classList.remove("invalid");
    this.classList.add("valid");
    emailError.style.display = "none";
  } else {
    this.classList.remove("valid");
    this.classList.add("invalid");
    emailError.style.display = "block";
  }

  updateSubmitButton();
});

phoneInput.addEventListener("input", function () {
  const isValid = validatePhone(this.value);

  if (this.value === "") {
    this.classList.remove("valid", "invalid");
    phoneError.style.display = "none";
  } else if (isValid) {
    this.classList.remove("invalid");
    this.classList.add("valid");
    phoneError.style.display = "none";
  } else {
    this.classList.remove("valid");
    this.classList.add("invalid");
    phoneError.style.display = "block";
  }

  updateSubmitButton();
});

passwordInput.addEventListener("input", function () {
  const isValid = validatePassword(this.value);

  if (this.value === "") {
    this.classList.remove("valid", "invalid");
    passwordError.style.display = "none";
    strengthFill.style.width = "0%";
    strengthText.textContent = "Password strength: Very Weak";
  } else if (isValid) {
    this.classList.remove("invalid");
    this.classList.add("valid");
    passwordError.style.display = "none";
  } else {
    this.classList.remove("valid");
    this.classList.add("invalid");
    passwordError.style.display = "block";
  }

  // Update password strength indicator
  checkPasswordStrength(this.value);

  // Also validate confirm password if it has value
  if (confirmPasswordInput.value !== "") {
    validateConfirmPassword();
  }

  updateSubmitButton();
});

function validateConfirmPassword() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (confirmPassword === "") {
    confirmPasswordInput.classList.remove("valid", "invalid");
    confirmPasswordError.style.display = "none";
  } else if (password === confirmPassword && password !== "") {
    confirmPasswordInput.classList.remove("invalid");
    confirmPasswordInput.classList.add("valid");
    confirmPasswordError.style.display = "none";
  } else {
    confirmPasswordInput.classList.remove("valid");
    confirmPasswordInput.classList.add("invalid");
    confirmPasswordError.style.display = "block";
  }
}

confirmPasswordInput.addEventListener("input", validateConfirmPassword);

// Update submit button state
function updateSubmitButton() {
  const isEmailValid = validateEmail(emailInput.value);
  const isPhoneValid = validatePhone(phoneInput.value);
  const isPasswordValid = validatePassword(passwordInput.value);
  const isConfirmPasswordValid =
    passwordInput.value === confirmPasswordInput.value &&
    passwordInput.value !== "";
  const isTermsChecked = document.getElementById("terms").checked;

  if (
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isTermsChecked
  ) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

document.getElementById("terms").addEventListener("change", updateSubmitButton);

// Format phone number as user types
phoneInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 11) {
    value = value.substring(0, 10);
  }

  if (value.length >= 6) {
    value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
  } else if (value.length >= 3) {
    value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
  } else if (value.length > 0) {
    value = `(${value}`;
  }

  e.target.value = value;
});

// Form submission
registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Final validation
  const isEmailValid = validateEmail(emailInput.value);
  const isPhoneValid = validatePhone(phoneInput.value);
  const isPasswordValid = validatePassword(passwordInput.value);
  const isConfirmPasswordValid =
    passwordInput.value === confirmPasswordInput.value &&
    passwordInput.value !== "";
  const isTermsChecked = document.getElementById("terms").checked;
  console.log(`email: ${isEmailValid}`);
  console.log(`email: ${isPhoneValid}`);

  if (!isEmailValid) {
    emailInput.classList.add("invalid");
    emailError.style.display = "block";
  }

  if (!isPhoneValid) {
    phoneInput.classList.add("invalid");
    phoneError.style.display = "block";
  }

  if (!isPasswordValid) {
    passwordInput.classList.add("invalid");
    passwordError.style.display = "block";
  }

  if (!isConfirmPasswordValid) {
    confirmPasswordInput.classList.add("invalid");
    confirmPasswordError.style.display = "block";
  }

  if (!isTermsChecked) {
    alert("Please agree to the Terms of Service and Privacy Policy");
    return;
  }

  if (
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isTermsChecked
  ) {
    // Simulate registration process
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    // In a real application, this would be an API call
    try {
      const userData = {
        username: username.value,
        email: emailInput.value,
        phoneNumber: phoneInput.value,
        password: passwordInput.value,
      };
      console.log(userData);

      await axios.post("/users", userData);
      console.log("user Created", userData);
    } catch (err) {
      console.log("Failed To Send Data To BackEnd", err.message);
    }

    // Reset form
    registerForm.reset();
    emailInput.classList.remove("valid", "invalid");
    phoneInput.classList.remove("valid", "invalid");
    passwordInput.classList.remove("valid", "invalid");
    confirmPasswordInput.classList.remove("valid", "invalid");
    strengthFill.style.width = "0%";
    strengthText.textContent = "Password strength: Very Weak";

    // Reset button
    submitBtn.innerHTML = "Create Account";
    submitBtn.disabled = false;

    window.location.href = "login.html";
  }
});
