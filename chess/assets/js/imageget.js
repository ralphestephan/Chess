function updateProfileImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function(e) {
      // Update profile image
      document.getElementById('profileImage').src = e.target.result;
      
      // Update the image in the navigation menu as well
      document.getElementById('navProfileImage').src = e.target.result;
  
      // Save the updated profile image URL in localStorage
      localStorage.setItem('profileImage', e.target.result);
    }
  
    if (file) {
      reader.readAsDataURL(file);
    }
  }
  