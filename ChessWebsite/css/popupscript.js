// Open the popup
function openPopup(popupId) {
    document.getElementById(popupId).style.display = "flex";
  }
  
  // Close the popup
  function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
  }
  
  // Close the popup if the user clicks outside of it
  window.onclick = function(event) {
    if (event.target.className === 'popup') {
      event.target.style.display = "none";
    }
  }
  
  // Login form validation
function validateLogin() {
    // Clear any previous errors
    let isValid = true;
    document.getElementById("loginUsernameError").style.display = "none";
    document.getElementById("loginPasswordError").style.display = "none";
  
    // Check if fields are empty
    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;
  
    if (loginUsername.trim() === "") {
      document.getElementById("loginUsernameError").style.display = "block";
      isValid = false;
    }
  
    if (loginPassword.trim() === "") {
      document.getElementById("loginPasswordError").style.display = "block";
      isValid = false;
    }
  
    return isValid; // Prevent form submission if not valid
  }
  
  // Signup form validation
  function validateSignup() {
    // Clear any previous errors
    let isValid = true;
    document.getElementById("signupEmailError").style.display = "none";
    document.getElementById("signupUsernameError").style.display = "none";
    document.getElementById("signupPasswordError").style.display = "none";
  
    // Check if fields are empty
    const signupEmail = document.getElementById("signupEmail").value;
    const signupUsername = document.getElementById("signupUsername").value;
    const signupPassword = document.getElementById("signupPassword").value;
  
    if (signupEmail.trim() === "") {
      document.getElementById("signupEmailError").style.display = "block";
      isValid = false;
    }
  
    if (signupUsername.trim() === "") {
      document.getElementById("signupUsernameError").style.display = "block";
      isValid = false;
    }
  
    if (signupPassword.trim() === "") {
      document.getElementById("signupPasswordError").style.display = "block";
      isValid = false;
    }
  
    return isValid; // Prevent form submission if not valid
  }

  //sign in/login backend
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("submitsignin").addEventListener("click", async () => {
        const username = document.getElementById("signupUsername").value;
        const password = document.getElementById("signupPassword").value;

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signupUsername, signupPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            userId = result.user_id;
            alert("Sign-in successful!");
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("game-section").style.display = "block";
        } else {
            alert(`Error: ${result.message}`);
        }
    });
    document.getElementById("sign-up").addEventListener("click", async () => {
        const username = document.getElementById("signupUsername").value;
        const password = document.getElementById("signupPassword").value;

        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signupUsername, signupPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Sign-up successful! You can now log in.");
        } else {
            alert(`Error: ${result.message}`);
        }
    });
})