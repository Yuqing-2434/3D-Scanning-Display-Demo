# 3D Specimen Display Demo

![Banner](img/1.21.6_ChaseTheSkies_Header.png)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)]()
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)]()
[![model-viewer](https://img.shields.io/badge/model--viewer-Google-4285F4?style=flat&logo=google&logoColor=white)]()

A lightweight, fully responsive frontend demo designed to elegantly display 3D scanned models. This project utilizes a retro, Minecraft-inspired GUI aesthetic combined with modern WebGL rendering to create an interactive gallery experience.

🔗 **Live Demo:** [Explore the Specimen Here](https://xxxstars0.github.io/3D-Scanning-Display-Demo/)

## ✨ Highlights

* **Interactive 3D Preview:** Utilizes Google's `<model-viewer>` component for native, high-performance `.glb` rendering with orbit and zoom controls.
* **Decoupled Configuration:** Text, image paths, and model URLs are completely separated from the code via a `data.json` configuration file, making updates effortless.
* **Orthographic Gallery:** A responsive grid to preview the specimen from all 6 axis angles. Clicking on any thumbnail opens a clean modal overlay for higher resolution viewing.
* **Minecraft GUI Aesthetic:** Custom styled UI with authentic pixel fonts and embossed panels mimicking classic gaming interfaces.
* **Lightweight & Vanilla:** Built with pure HTML, CSS, and JavaScript without any heavy frameworks, allowing for instant loading and simple hosting.

## 🛠️ Production Workflow

The digital assets used in this demo were created using the following workflow:

1. **Scanning:** The 3D models were scanned and processed using the [Apple Reality Composer](https://apps.apple.com/us/app/reality-composer/id1462358802) app on iOS.
2. **Rendering & Processing:** The 6-sided orthographic screenshots with transparent backgrounds were generated using Unity.

## 🚀 Performance Optimization

To ensure fast load times and a smooth user experience, the 3D models have been heavily optimized:

* **Dual Compression Strategy:** The 3D model uses both **Draco compression** (for geometry/meshes) and **WebP compression** (for embedded textures) using the `@gltf-transform/cli` tool.
* **Massive Size Reduction:** The final model size was reduced by over **96%** (from 13.8 MB down to 532 KB) while remaining visually lossless.
* *Note: The original uncompressed model (`Happy Ghast in a Box_9746.glb`) is kept in the `models/` directory strictly as a high-fidelity reference for future edits.*

## ⚙️ Usage & Configuration

Because this project dynamically loads local JSON data and 3D models, it must be run through a local web server to bypass browser CORS security restrictions.

### How to Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/XXXStars0/3D-Scanning-Display-Demo.git
   ```
   (Or download the ZIP archive from the GitHub project page).
2. Serve the root directory using any local web server. For example:
   * **Python:** Run `python -m http.server` (or `python3`) in the terminal and visit `http://localhost:8000`.
   * **VS Code:** Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".
   * **Node.js:** Run `npx serve .`

### How to Configure Content

You do not need to modify any HTML or JS files to change the displayed content. Simply edit the `js/data.json` file:

```json
{
  "title": "Happy Ghast Specimen",
  "description": "Your detailed description here...",
  "modelUrl": "models/Your_Model.glb",
  "bannerUrl": "img/Your_Banner.png",
  "images": [
    { "id": "front", "src": "img/path_to_front.png", "label": "Front View" }
    // Add up to 6 image objects here
  ]
}
```

## 🤖 AI Guide Integration (Pure Frontend)

This project features a fully client-side AI integration allowing users to chat with an intelligent "Museum Guide".
* **User-Configurable API:** Because this is a static site, users must provide their own OpenAI-compatible API URL and API Key via the "⚙ AI Settings" button.
* **Local Storage Security:** API credentials are saved securely in the browser's `localStorage` and are never transmitted anywhere except to the configured LLM provider.
* **Dynamic Knowledge Base:** The AI is context-aware. It loads facts dynamically from `data/knowledge.md` to accurately answer questions about the specific 3D specimen (e.g., Happy Ghast lore, Kleenex box dimensions) without hallucinating.

### Local Development (.env Support)
If you are running the project locally (e.g., via `python -m http.server`), you can create a `.env` file in the root directory to avoid typing your API key every time:
```env
API_URL=https://api.openai.com/v1/chat/completions
API_KEY=sk-your_api_key_here
```
*Note: The `.env` file is excluded from Git tracking via `.gitignore`. The web interface will attempt to fetch it silently on load; if deployed to production (like GitHub Pages), this fetch safely fails and falls back to user input.*

## 🌐 Deployment (GitHub Pages)

This project is deployed and hosted for free via **GitHub Pages**. 

The live site is automatically built and updated from the `main` branch: [https://xxxstars0.github.io/3D-Scanning-Display-Demo/](https://xxxstars0.github.io/3D-Scanning-Display-Demo/)

## 📝 Future Roadmap & Planned Features

*   **Interactive Hotspots & Guides:** Add clickable annotation points directly on the 3D model that pop up specific anatomical or structure explanations.
*   **AI LLM Integration:** Embed a chatbot sidebar powered by a Large Language Model to act as a virtual tour guide/specimen expert, allowing users to ask questions about the scanned item.
*   **Dynamic Multi-Specimen Support:** Refactor the codebase to support multiple items using a central config routing system.