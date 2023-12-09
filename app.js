// extension/server/app.js
import express from 'express';
import bodyParser from 'body-parser';
import jsonfile from 'jsonfile';
import path from 'path';

const app = express();
const port = 5000;

app.use(bodyParser.json());

// A list to store logged URLs
const loggedUrls = [];
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Use the fileURLToPath and dirname functions to get the directory path
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);

const regex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+)/;

// Create an empty micromanager_info object
// const MicromanagerInfo = {
//     micromanage: false,
//     allowed_websites: []
//   };
  
//   // Save the empty micromanager_info to chrome.storage.local
//   chrome.storage.local.set({ micromanagerInfo: MicromanagerInfo }, function () {
//     if (chrome.runtime.lastError) {
//       console.error(chrome.runtime.lastError);
//     } else {
//       console.log('Empty micromanager_info created in chrome.storage.local');
//     }
//   });

// Your update_file_with_url function
function updateFileWithUrl(url, duration) {
    // Fetch micromanager_info from chrome.storage.local
    chrome.storage.local.get('micromanagerInfo', function (data) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
  
      const updateMicromanagerInfo = data.micromanagerInfo || { micromanage: false, allowed_websites: [] };
  
      // Add the new URL to the allowed websites
      updateMicromanagerInfo.allowed_websites.push(url);
  
      // Update the micromanager_info in chrome.storage.local
      chrome.storage.local.set({ micromanagerInfo : updateMicromanagerInfo}, function () {
        console.log(`Updated micromanager_info with URL: ${url} for ${duration} minutes`);
        
        // Schedule a timeout to reset the micromanager_info after the specified duration
        setTimeout(function () {
          // Remove the URL from allowed websites after the duration
          micromanagerInfo.allowed_websites = micromanagerInfo.allowed_websites.filter(allowedUrl => allowedUrl !== url);
  
          // Update the micromanager_info in chrome.storage.local
          chrome.storage.local.set({ micromanagerInfo }, function () {
            console.log(`Removed URL: ${url} from allowed websites`);
          });
        }, duration * 60 * 1000); // Convert minutes to milliseconds for setTimeout
      });
    });
  }
  
  
// Route to allowed URL
app.post('/log-url', (req, res) => {
    const { url } = req.body;

    if (url) {
        // loggedUrls.push(url);
        const formattedUrl = updateFileWithUrl(url);
        res.json({ status: 'success', message: 'URL logged successfully', formattedUrl });
    } else {
        res.json({ status: 'error', message: 'Invalid URL' });
    }
});

// Route to get logged URLs
app.get('/get-logged-urls', (req, res) => {
    res.json(loggedUrls);
});


// app.post('/check', (req, res) => {
  
//   console.log(`inside check, implementing url check - ${req}`);
  
//   const { url } = req.body;
//   const match = url.match(regex);

//   // Extract the domain from the match
//   const newStringValue = match ? 'www.' + match[1] : url;

//   // Fetch micromanager_info from chrome.storage.local
//   chrome.storage.local.get('micromanagerInfo', function (data) {
//     if (chrome.runtime.lastError) {
//       console.error(chrome.runtime.lastError);
//     }

//     const micromanagerInfo = data.micromanagerInfo || { micromanage: false, allowed_websites: [] };

//     // Check if micromanage is active and the URL is not in allowed_websites
//     console.log(`checking current status of micromanager - ${micromanagerInfo}`);

//     if (micromanagerInfo.micromanage && !micromanagerInfo.allowed_websites.includes(url)) {
//       // Implement your logic to close the window here
//       console.log(`Blocking access to URL: ${url}`);
//       res.json({ shouldCloseWindow: true, formattedUrl: newStringValue });
//     } else {
//       // Implement your check logic here if needed
//       res.json({ shouldCloseWindow: false, formattedUrl: newStringValue });
//     }
//   });
// });

app.post('/check', (req, res) => {
  console.log('Inside check, implementing URL check');
  
  const { url } = req.body;
  const match = url.match(regex);

  // Extract the domain from the match
  const newStringValue = match ? 'www.' + match[1] : url;

  // Fetch micromanager_info from chrome.storage.local
  chrome.storage.local.get('micromanagerInfo', function (data) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }

    const micromanagerInfo = data.micromanagerInfo || { micromanage: false, allowed_websites: [] };

    // Check if micromanage is active and the URL is not in allowed_websites
    console.log(`Checking current status of micromanager: url - ${newStringValue}, micromanagerInfo - ${JSON.stringify(micromanagerInfo)}`);

    if (micromanagerInfo.micromanage && !micromanagerInfo.allowed_websites.includes(newStringValue)) {
      // Implement your logic to close the window here
      console.log(`Blocking access to URL: ${url}`);
      res.json({ shouldCloseWindow: true, formattedUrl: newStringValue });
    } else {
      // Implement your check logic here if needed
      res.json({ shouldCloseWindow: false, formattedUrl: newStringValue });
    }
  });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;  // Export the express app
