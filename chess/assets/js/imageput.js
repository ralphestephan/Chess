// Check if there's an updated profile image in localStorage
window.onload = function() {
    const profileImageUrl = localStorage.getItem('profileImage');
  
    // If the profile image exists in localStorage, update the image elements
    if (profileImageUrl) {
      document.getElementById('profileImage').src = profileImageUrl;
      document.getElementById('navProfileImage').src = profileImageUrl;
    }
  };
  window.onload = function() {
    const profileImageUrl = localStorage.getItem('profileImage');
  
    // Set default image if no updated profile image
    if (!profileImageUrl) {
      document.getElementById('profileImage').src = 'unnamed.png';
      document.getElementById('navProfileImage').src = 'unnamed.png';
    } else {
      // Use the updated image from localStorage
      document.getElementById('profileImage').src = profileImageUrl;
      document.getElementById('navProfileImage').src = profileImageUrl;
    }
  };
  