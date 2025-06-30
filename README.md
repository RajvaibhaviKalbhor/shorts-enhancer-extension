# 🎬 YouTube Shorts Enhancer - Chrome Extension

A Chrome Extension that enhances the YouTube Shorts experience with:
- **Auto-scroll to next Short** when the current one ends
- **Voice control** with commands like `next`, `previous`, `mute`, etc.
-  A clean **floating control panel** to toggle features in real-time
- Built with **React**, **Vite**, and **Tailwind CSS**

---

## 🚀 Features

- **Auto-Scroll**  
  Automatically scrolls to the next Short when the video ends.

- **Manual Mode**  
  Switch off auto-scroll to watch Shorts at your own pace.

- **Voice Commands**  
  Use natural commands like:
  - `next` → Go to the next video  
  - `back` / `previous` → Go to the previous video  
  - `pause`, `play`, `mute`, `unmute`  
  - `stop` / `stop listening` → Turn off voice control  

- **Floating UI Panel**  
  Minimal interface. Toggle modes and voice control in real-time.

---

## 🧱 Built With

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Chrome Extensions API
- Web Speech API

---

## 🧑‍💻 Getting Started (for developers)

### 1. Clone the repo
```bash
git clone https://github.com/RajvaibhaviKalbhor/shorts-enhancer-extension.git
cd shorts-enhancer-extension
npm install
npm run build

4. Load the extension in Chrome
Go to chrome://extensions
Enable Developer Mode
Click Load Unpacked
Select the dist/ folder