# English Dictation App

A powerful English dictation practice app built with SvelteKit and Capacitor that works on both web and mobile devices. Practice English listening skills with customizable word lists and natural voice synthesis.

![English Dictation App](https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🎧 **Natural Voice Synthesis**: Uses Web Speech API for high-quality, natural-sounding English voices
- 📝 **Customizable Word Lists**: Add your own words or use sample word lists
- ⚙️ **Flexible Settings**: Configure word count, pause duration, speech rate, and pitch
- 📱 **Cross-Platform**: Runs on web browsers and Android devices
- 💾 **Local Storage**: Words and settings are saved locally on your device
- 🎯 **Progress Tracking**: Real-time progress display during tests
- 📊 **Results Analysis**: Detailed results with statistics after each session
- 🔄 **Offline Support**: Works without internet connection once loaded
- 📱 **Mobile Optimized**: Touch-friendly UI designed for mobile devices

## 🚀 Quick Start

### Web Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

### Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📱 Android Setup & Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Android Studio](https://developer.android.com/studio)
- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (v11 or later)

### Initial Android Setup

1. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

2. **Add Android platform:**
   ```bash
   npx cap add android
   ```

3. **Sync with Android project:**
   ```bash
   npm run cap:sync
   ```

### Running on Android

#### Option 1: Android Studio (Recommended)

1. **Open in Android Studio:**
   ```bash
   npm run android
   ```
   This command will:
   - Sync the latest web build with Android
   - Open Android Studio automatically

2. **In Android Studio:**
   - Connect your Android device via USB (with USB debugging enabled)
   - Or use an Android Virtual Device (AVD)
   - Click the "Run" button (green play icon)

#### Option 2: Command Line

1. **Build and sync:**
   ```bash
   npm run build:android
   ```

2. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

### Android Device Setup

1. **Enable Developer Options:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options

2. **Enable USB Debugging:**
   - In Developer Options, enable "USB Debugging"
   - Connect your device to computer via USB
   - Allow USB debugging when prompted

3. **Install and run from Android Studio**

### Building APK

1. **In Android Studio:**
   - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Find the APK in `android/app/build/outputs/apk/debug/`

2. **For release build:**
   - Go to Build > Generate Signed Bundle / APK
   - Follow the signing wizard

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run check        # Type checking
npm run lint         # Lint code
npm run format       # Format code

# Capacitor/Android
npm run android      # Sync and open Android Studio
npm run build:android # Build and sync for Android
npm run cap:add      # Add Android platform
npm run cap:sync     # Sync web assets to native
npm run cap:open     # Open native IDE
```

## 📂 Project Structure

```
english-dictation-app/
├── src/
│   ├── lib/
│   │   ├── components/        # Reusable Svelte components
│   │   │   ├── SpeechService.ts      # Web Speech API wrapper
│   │   │   └── TestController.ts     # Test flow management
│   │   └── stores/            # Svelte stores for state
│   │       ├── wordStore.ts          # Word list management
│   │       └── settingsStore.ts      # User settings
│   ├── routes/                # SvelteKit routes (pages)
│   │   ├── +layout.svelte            # Main layout
│   │   ├── +page.svelte              # Home page
│   │   ├── setup/+page.svelte        # Setup page
│   │   └── results/+page.svelte      # Results page
│   ├── app.html               # HTML template
│   └── app.css                # Global styles
├── android/                   # Android native project
├── capacitor.config.ts        # Capacitor configuration
├── svelte.config.js          # SvelteKit configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts
```

## 🎯 How to Use

### 1. Setup Your Word List

1. Navigate to the **Setup** page
2. Enter words in the text area (one per line)
3. Or click "Load Sample Words" for a starter list
4. Click "Save Words" to store your list

### 2. Configure Test Settings

- **Words per test**: Choose how many words to practice (1-50)
- **Pause duration**: Set time between words (0.5-10 seconds)
- **Voice**: Select from available English voices
- **Speech rate**: Adjust speaking speed (0.5x-2.0x)
- **Speech pitch**: Modify voice pitch (0.5x-2.0x)

### 3. Start Dictation Test

1. Return to the **Home** page
2. Click "Start Quick Test"
3. Listen to each word and write it down
4. Review your results when the test completes

### 4. Review Results

- View all dictated words
- See session statistics
- Copy or share your results
- Start a new test or modify settings

## 🔧 Troubleshooting

### Web Issues

**No voices available:**
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Some voices may require internet connection for first use
- Try refreshing the page

**Speech not working:**
- Check browser permissions for microphone/audio
- Ensure volume is turned up
- Try a different voice from the settings

### Android Issues

**Build errors:**
- Ensure Android Studio and SDK are properly installed
- Check that JAVA_HOME environment variable is set
- Update Capacitor: `npm install @capacitor/core@latest @capacitor/cli@latest`

**App crashes on device:**
- Check Android logs in Android Studio
- Ensure target SDK version compatibility
- Verify all permissions are granted

**Speech not working on Android:**
- Enable Google Text-to-Speech in Android settings
- Download additional voice data if needed
- Check audio permissions

## 🌟 Tips for Best Experience

1. **Voice Selection**: Local voices (🔊) provide better quality than online voices (🌐)
2. **Practice Regularly**: Short, frequent sessions are more effective than long ones
3. **Gradual Difficulty**: Start with simple words and progress to complex ones
4. **Adjust Timing**: Increase pause duration for challenging words
5. **Multiple Voices**: Practice with different voices to improve comprehension
6. **Mobile Usage**: The app works great on tablets and phones for on-the-go practice

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information about the problem

---

**Happy Learning! 🎓**

Practice makes perfect - use this app regularly to improve your English listening skills! 