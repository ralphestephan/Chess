function handleOfflineClick() {
    // Hide the original images
    document.getElementById('originalImages').style.display = 'none';
    
    // Show the new images container
    document.getElementById('newImages').style.display = 'flex';
    
    // Show the offline mode images
    document.getElementById('offlineModes').style.display = 'flex';
    document.getElementById('onlineModes').style.display = 'none';
    
    // Show the back button
    document.getElementById('backButton').style.display = 'block';
    
    // Change the heading text
    document.getElementById('titleMode').innerHTML = 'Offline <span class="highlight">Modes</span>';
}

function handleOnlineClick() {
    // Hide the original images
    document.getElementById('originalImages').style.display = 'none';
    
    // Show the new images container
    document.getElementById('newImages').style.display = 'flex';
    
    // Show the online mode images
    document.getElementById('onlineModes').style.display = 'flex';
    document.getElementById('offlineModes').style.display = 'none';
    
    // Show the back button
    document.getElementById('backButton').style.display = 'block';
    
    // Change the heading text
    document.getElementById('titleMode').innerHTML = 'Online <span class="highlight">Modes</span>';
}

document.getElementById('backButton').addEventListener('click', function() {
    // Show the original images
    document.getElementById('originalImages').style.display = 'flex';
    
    // Hide the new images
    document.getElementById('newImages').style.display = 'none';
    document.getElementById('offlineModes').style.display = 'none';
    document.getElementById('onlineModes').style.display = 'none';
    
    // Hide the back button
    document.getElementById('backButton').style.display = 'none';
    
    // Revert the heading text
    document.getElementById('titleMode').innerHTML = 'Select <span class="highlight">Gamemode</span>';
});