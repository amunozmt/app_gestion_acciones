<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to GitHub Pages.

View your app in AI Studio: https://ai.studio/apps/drive/1HNxaQArS-gG7bi6ChId44h_7SNa-9wFG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured for automatic deployment to GitHub Pages. The deployment happens automatically when you push to the `main` branch.

### Setup GitHub Pages (one-time setup):
1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The deployment workflow will run automatically on pushes to main

### Manual deployment:
```bash
npm run deploy
```

The app will be available at: `https://amunozmt.github.io/app_gestion_acciones/`
