// Function to validate the Login form
function validateLoginForm(event) {
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
  
    // Check if fields are empty
    if (username === "" || password === "") {
      alert("Please fill out both username and password fields.");
      event.preventDefault();  // Prevent form submission
      return false;
    }
    return true;
  }
  
  // Function to validate the SignUp form
  function validateSignUpForm(event) {
    var email = document.getElementById('signupEmail').value;
    var username = document.getElementById('signupUsername').value;
    var password = document.getElementById('signupPassword').value;
  
    // Check if fields are empty
    if (email === "" || username === "" || password === "") {
      alert("Please fill out all fields.");
      event.preventDefault();  // Prevent form submission
      return false;
    }
  
    // Validate email format (contains "@" and ends with ".com")
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com)$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address (must contain '@' and '.com').");
      event.preventDefault();  // Prevent form submission
      return false;
    }
  
    return true;
  }
  
  // Attach event listeners to the forms
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    if (!validateLoginForm(event)) {
      return; // If validation fails, stop form submission
    }
  });
  
  document.getElementById('signupForm').addEventListener('submit', function(event) {
    if (!validateSignUpForm(event)) {
      return; // If validation fails, stop form submission
    }
  });
  