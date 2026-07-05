# Website Highlight Saver 

A lightweight Google Chrome extension that lets you highlight text on any webpage and saves those highlights so you never lose track of important information.

## Features 
* **Easy Highlighting**: Select any text on a webpage to highlight it.
* **Centralized Dashboard**: Click the extension icon to view a list of all your saved highlights in a clean, easy-to-read popup menu.


## Project Structure 
* `manifest.json`: Configuration file that tells Chrome how to load the extension.
* `content.js` / `content.css`: Scripts and styles injected directly into webpages to handle text selection and visually highlighting elements.
* `popup.html` / `popup.js` / `popup.css`: The user interface and logic for the extension menu that appears when you click the icon in your toolbar.
* `options.html` / `options.js` / `options.css`: The settings page where users can configure their preferences.

## How to Install (Developer Mode) 
Since this extension is in development, you can load it locally into your browser:
1. Open Google Chrome.
2. Type `chrome://extensions/` in your address bar and press Enter.
3. Toggle the **Developer mode** switch in the top right corner.
4. Click the **Load unpacked** button in the top left corner.
5. Select the folder containing these project files (`Website_Hightlight_Saver`).
6. The extension is now installed! Pin it to your toolbar for easy access.

## How to Use 
1. Navigate to any article or webpage.
2. Highlight a piece of text you want to save.
3. The text will be highlighted on the screen.
4. Click the extension icon in your Chrome toolbar to view your saved highlights.

## Technologies Used 
* HTML / CSS / Vanilla JavaScript
* Chrome Extension APIs (`chrome.storage`, `chrome.scripting`, `chrome.tabs`)
