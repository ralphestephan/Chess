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
        window.location.href = '../playonline/index.html';

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

function handleOffline1Click() {
    console.log('offlineImage1 clicked'); // Debugging line
    window.location.href = '../playoffline/index.html';
};

function handleOnline1Click() {
    console.log('onlineImage1 clicked'); // Debugging line
    window.location.href = '../playonline/index.html';
};