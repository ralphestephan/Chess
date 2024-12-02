
  document.getElementById('offlineImage').addEventListener('click', function() {
    // Hide the original images
    document.getElementById('offlineImage').style.display = 'none';
    document.getElementById('onlineImage').style.display = 'none';

    // Show the new images
    document.getElementById('offlineImage1').style.display = 'block';
    document.getElementById('offlineImage2').style.display = 'block';

    // Show the back button
    document.getElementById('backButton').style.display = 'block';

    // Change the heading text
    document.getElementById('titleMode').querySelector('h4').innerHTML = '<em>Offline</em>  Modes';
  });

  
  document.getElementById('onlineImage').addEventListener('click', function() {
    // Hide the original images
    document.getElementById('offlineImage').style.display = 'none';
    document.getElementById('onlineImage').style.display = 'none';

    // Show the new images
    document.getElementById('onlineImage1').style.display = 'block';
    document.getElementById('onlineImage2').style.display = 'block';

    // Show the back button
    document.getElementById('backButton').style.display = 'block';

    // Change the heading text
    document.getElementById('titleMode').querySelector('h4').innerHTML = '<em>Online</em>  Modes';
  });


  document.getElementById('backButton').addEventListener('click', function() {
    // Show the original images
    document.getElementById('offlineImage').style.display = 'block';
    document.getElementById('onlineImage').style.display = 'block';

    // Hide the new images
    document.getElementById('offlineImage1').style.display = 'none';
    document.getElementById('offlineImage2').style.display = 'none';
    document.getElementById('onlineImage1').style.display = 'none';
    document.getElementById('onlineImage2').style.display = 'none';

    // Hide the back button
    document.getElementById('backButton').style.display = 'none';

    // Revert the heading text
    document.getElementById('titleMode').querySelector('h4').innerHTML = '<em>Select</em> Gamemode';
  });
  
