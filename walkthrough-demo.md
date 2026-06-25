# Walkthrough: Screenshot Demo Mode

We have implemented a **Screenshot Demo Mode** in the ThreadMood app. This allows you to view and capture screenshots of every UI state immediately without uploading files or making calls to the Gemini API.

## How to Access Demo Mode

1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the base demo page:
   [http://localhost:3000/demo](http://localhost:3000/demo)

## State URLs & Explanations

You can directly navigate to the following URLs to load each specific UI state:

| State / URL | Mode | Target UI State Description |
| :--- | :--- | :--- |
| [`/demo?state=thread-upload`](http://localhost:3000/demo?state=thread-upload) | Thread | Empty state. Prompting the user to select/upload a single image. |
| [`/demo?state=thread-preview`](http://localhost:3000/demo?state=thread-preview) | Thread | Uploaded image preview state. Includes prefilled Category ("ท้องฟ้า") and Tone ("ฮีลใจ"), ready for submission. |
| [`/demo?state=thread-loading`](http://localhost:3000/demo?state=thread-loading) | Thread | Loading state with the animated spinner and static pre-determined text to prevent flickering during capture. |
| [`/demo?state=thread-result`](http://localhost:3000/demo?state=thread-result) | Thread | Thread results panel showing mocked Thai content (mood analysis, overlay threads, captions, music matches, and hashtags). |
| [`/demo?state=thread-error`](http://localhost:3000/demo?state=thread-error) | Thread | Error feedback banner when Gemini API fails. |
| [`/demo?state=photo-picker-upload`](http://localhost:3000/demo?state=photo-picker-upload) | Picker | Empty photo picker state. Ready for dragging/selecting 2-6 images. |
| [`/demo?state=photo-picker-preview`](http://localhost:3000/demo?state=photo-picker-preview) | Picker | 6 local SVG placeholder images preloaded in a numbered grid ("รูป 1" to "รูป 6"). Platform and Mood chosen, ready for submission. |
| [`/demo?state=photo-picker-loading`](http://localhost:3000/demo?state=photo-picker-loading) | Picker | Loading state for the photo picker model analysis. |
| [`/demo?state=photo-picker-result`](http://localhost:3000/demo?state=photo-picker-result) | Picker | Curated analysis results panel. Displays rank cards, Story sequences with image previews, recommended cover photos, captions, and hashtags. |
| [`/demo?state=photo-picker-error`](http://localhost:3000/demo?state=photo-picker-error) | Picker | Error feedback banner for the photo picker flow. |

## Clean Screenshot Mode (`clean=1`)

To take screenshot captures without **any** demo badge/warning banner, floating restore button, or floating control panel, append `&clean=1` to any state URL. The layout will hide all control panels, red warning badges, and margin helpers, leaving the page pristine and ready for a device screenshot.

### Clean URLs for Screenshotting:

- **Thread Generation Mode**:
  - [Thread Upload (Clean)](http://localhost:3000/demo?state=thread-upload&clean=1)
  - [Thread Preview (Clean)](http://localhost:3000/demo?state=thread-preview&clean=1)
  - [Thread Loading (Clean)](http://localhost:3000/demo?state=thread-loading&clean=1)
  - [Thread Result (Clean)](http://localhost:3000/demo?state=thread-result&clean=1)
  - [Thread Error (Clean)](http://localhost:3000/demo?state=thread-error&clean=1)

- **Photo Picker Mode**:
  - [Picker Upload (Clean)](http://localhost:3000/demo?state=photo-picker-upload&clean=1)
  - [Picker Preview (Clean)](http://localhost:3000/demo?state=photo-picker-preview&clean=1)
  - [Picker Loading (Clean)](http://localhost:3000/demo?state=photo-picker-loading&clean=1)
  - [Picker Result (Clean)](http://localhost:3000/demo?state=photo-picker-result&clean=1)
  - [Picker Error (Clean)](http://localhost:3000/demo?state=photo-picker-error&clean=1)

## Screenshot Features & UX Optimization

- **Floating Demo Panel**: A control panel appears at the bottom of the page in `/demo` for fast switching.
- **Pristine Capture**: You can click the red **"ซ่อนแผง"** (Hide Panel) button to hide the control overlay entirely. A small eye icon (`👁️`) will float in the bottom-right corner to restore it whenever you need to switch states again (or use `clean=1` for completely hidden overlays).
- **Stable Layouts**:
  - No randomly fluctuating text or timers.
  - Constant loading messages for loading states.
  - Stably sized local SVG gradients to avoid layout shifts.
  - Zero network requests are made, keeping screenshots fast and clean.

