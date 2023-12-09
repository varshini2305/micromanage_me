document.addEventListener('DOMContentLoaded', function () {
  // Display the list of blocked websites
  chrome.storage.sync.get('blockedWebsites', function (data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }

    var blockedList = document.getElementById('blocked-list');
    console.log('Blocked websites:', data.blockedWebsites);

    if (data.blockedWebsites) {
      data.blockedWebsites.forEach(function (website) {
        var li = document.createElement('li');
        li.textContent = website;
        blockedList.appendChild(li);
      });
    }
  });

  // Block a new website
  var blockForm = document.getElementById('block-form');
  blockForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var urlInput = document.getElementById('url-input');
    var durationInput = document.getElementById('duration-input');
    var url = urlInput.value.trim();
    var duration = parseFloat(durationInput.value);

    if (url && !isNaN(duration) && duration > 0) {
      // Block the website
      blockWebsite(url, duration);
    } else {
      console.error('Invalid input. Please enter a valid URL and duration.');
    }
  });

function processUrl(url_string) {
    // Remove 'http://' or 'https://'
    const withoutProtocol = url_string.replace(/^https?:\/\//, '');
  
    // Add 'www.' if not present
    const withWWW = withoutProtocol.startsWith('www.') ? withoutProtocol : 'www.' + withoutProtocol;
  
    // Extract the domain until the first occurrence of '/'
    const domain = withWWW.split('/')[0];
  
    return domain;
  }
// function processUrl(url_string) {
//   // Remove 'http://' or 'https://'
//   let processedUrl = url_string.replace(/^https?:\/\//i, '');

//   // Add 'www.' if it's not present
//   if (!processedUrl.startsWith('www.')) {
//     processedUrl = 'www.' + processedUrl;
//   }
  
//   return processedUrl;
// }
// Function to block the website
function blockWebsite(url, duration) {
  // Send a message to background.js to initiate the blocking process
  
  url = processUrl(url)
  console.log(`popup - blockWebsite - processed url - ${url}`)
  
  chrome.runtime.sendMessage({
    action: "blockWebsite",
    url: url,
    duration: duration
  }, function (response) {
    if (response.success) {
      // Update the UI to display the allowed website
      var blockedList = document.getElementById('blocked-list');
      var li = document.createElement('li');
      li.textContent = url;
      blockedList.appendChild(li);
      console.log(`logged ${blockedList}`)

      // Clear input fields
      // urlInput.value = '';
      // durationInput.value = '';

      // Optionally, provide user feedback (you might want to enhance this)
      alert(`Blocked ${url} for ${duration} minutes successfully!`);
    } else {
      // Handle errors in a user-friendly manner
      console.error('Error blocking website:', response.error);
      alert(`Error blocking website: ${response.error}`);
    }
  });
}
});
