// function processUrl(url_string) {
//   // Remove 'http://' or 'https://'
//   let processedUrl = url_string.replace(/^https?:\/\//i, '');

//   // Add 'www.' if it's not present
//   if (!processedUrl.startsWith('www.')) {
//     processedUrl = 'www.' + processedUrl;
//   }

//   return processedUrl;
// }

function processUrl(url_string) {
  // Remove 'http://' or 'https://'
  const withoutProtocol = url_string.replace(/^https?:\/\//, '');

  // Add 'www.' if not present
  const withWWW = withoutProtocol.startsWith('www.') ? withoutProtocol : 'www.' + withoutProtocol;

  // Extract the domain until the first occurrence of '/'
  const domain = withWWW.split('/')[0];

  return domain;
}

function logUrl(url_string) {
  fetch('http://localhost:5000/log-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url_string }),
  })
  .then(response => {
    if (response.status == 500){
      
      checkAndCloseWindow(url_string)
  }})
  .catch(error => {
    console.error('log url - Fetch error:', error);
  });
}

function checkAndCloseWindow(url_string, res) {
  fetch('http://localhost:5000/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url_string}),
  })
  .then(response =>response.json())
  .then(data => {
    var shouldCloseWindow = false;
    
    url_string = processUrl(url_string);
    
    console.log(`checkAndCloseWindow - url_string: ${url_string}`)
    
    var return_val = { shouldCloseWindow: false, formattedUrl: url_string };
    // Fetch micromanager_info from chrome.storage.local
    chrome.storage.local.get('micromanagerInfo', function (data) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }

      const currentMicromanagerInfo = data.micromanagerInfo || { micromanage: false, allowed_websites: [] };

      // Check if micromanage is active and the URL is not in allowed_websites
      console.log(`Checking current status of micromanager: currentMicromanagerInfo.micromanage - ${currentMicromanagerInfo.micromanage}, currentMicromanagerInfo.allowed_websites - ${currentMicromanagerInfo.allowed_websites}`);

      if (currentMicromanagerInfo.micromanage && !currentMicromanagerInfo.allowed_websites.includes(url_string)) {
        // Implement your logic to close the window here
        
        console.log(`Blocking access to URL: ${url_string}`);
        
        shouldCloseWindow = true;
        
        return_val = { shouldCloseWindow: true, formattedUrl: url_string };
        
        if (shouldCloseWindow) {
          // Get the current tab ID
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTabId = tabs[0].id;
    
            // Close the current tab
            chrome.tabs.remove(currentTabId, function () {
              // Check if there was an error
              if (chrome.runtime.lastError) {
                console.error('Error closing tab:', chrome.runtime.lastError);
              }
            });
          });
        };
      } else {
        // Implement your check logic here if needed
        return_val = { shouldCloseWindow: false, formattedUrl: url_string};
      }
    });
    
    console.log(`check response: ${data}`)
    console.log(`shouldCloseWindow: ${shouldCloseWindow}, formattedUrl: ${url_string}`)
    if (shouldCloseWindow) {
      // Get the current tab ID
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTabId = tabs[0].id;

        // Close the current tab
        chrome.tabs.remove(currentTabId, function () {
          // Check if there was an error
          if (chrome.runtime.lastError) {
            console.error('Error closing tab:', chrome.runtime.lastError);
          }
        });
      });
    }
    return return_val
  })
  .catch(error => {
    console.error(error);
  });
}


function blockWebsite(url, duration, sendResponse) {
  // Fetch micromanager_info from chrome.storage.local
  chrome.storage.local.get('micromanagerInfo', function (data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }

    const setMicromanagerInfo = { micromanage: true, allowed_websites: [url]};

    

    try {
      // Save the updated micromanager_info to chrome.storage.local
      chrome.storage.local.set(
        {
          micromanagerInfo: setMicromanagerInfo
        },
        function () {
          // This function is a callback executed after the storage is set
          // Fetch micromanager_info from chrome.storage.local again to get the updated value
          chrome.storage.local.get('micromanagerInfo', function (data) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
    
            const updatedMicromanagerInfo = data.micromanagerInfo || { micromanage: false, allowed_websites: [] };
    
            console.log(`Blocked all websites except ${url} for ${duration} minutes`);
            console.log(`After setting chrome.storage.local - micromanagerInfo.micromanage: ${updatedMicromanagerInfo.micromanage}, micromanagerInfo.allowed_websites: ${updatedMicromanagerInfo.allowed_websites}`);
            // Check if micromanage is true and do something
            if (updatedMicromanagerInfo.micromanage) {
              console.log('Micromanage is active!');
            }
    
            // Sleep for the specified duration
            setTimeout(function () {
              // After the sleep duration, reset the micromanager_info
              chrome.storage.local.set({ micromanagerInfo: { micromanage: false, allowed_websites: [] } }, function () {
                console.log('Micromanager deactivated!!');
    
                // Send a response to the popup.js indicating success
                sendResponse({ success: true });
              });
            }, duration * 60 * 1000); // Convert minutes to milliseconds for setTimeout
          });
        }
      );
    } catch (error) {
      console.error('Error blocking website:', error);
      sendResponse({ success: false, error: error.message });
    }
  });
}



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "logUrl") {
    logUrl(request.url);
  } else if (request.action === "checkAndCloseWindow") {
    checkAndCloseWindow(request.url);
  } else if (request.action === "blockWebsite") {
    blockWebsite(request.url, request.duration, sendResponse);
  }

  return true; // Use return true to indicate that sendResponse will be called asynchronously
});