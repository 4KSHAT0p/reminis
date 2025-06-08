# ReMiniS

**ReMiniS** is a cross-platform mobile app built with **React Native** and **Expo** that captures photos enriched with **location (GPS)**, **weather**, **date**, and **time** metadata. Photos are organized into a sleek gallery and visualized on an interactive **map** with location-based markers.

---

## Features

- 📸 Capture photos with auto-tagging:
  - GPS location
  - Weather info
  - Date & Time
- 🖼️ View tagged photos in a clean, scrollable gallery
- 🗺️ Explore memories on an interactive map
- 💾 Save images to device gallery
- 📤 Share images directly from the app
- 🧼 Minimal and intuitive user interface

---





## Screenshots
<p align="center"> 
  <img src="https://github.com/user-attachments/assets/59a601e7-04a2-4f00-8dc6-d3965691acc9" width="30%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/a921863a-cd44-4465-bc79-da880cffdc8c" width="30%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/560d5b58-bbf8-41b9-9c19-5759c724233c" width="30%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/a61f3f34-a390-4aa5-91df-437d439985e4" width="30%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/972a29b3-9f39-43ab-aaed-b569da489cd9" width="30%" />
</p>
<br>

## OUR FIRST RELEASE IS OUT! GO CHECK IT OUT

### Download the apk from releases section.


<br>

## Setup for local development

### Prerequisites
Make sure you have installed the following before cloning the project:
- [Node.js (LTS)](https://nodejs.org/en/download)
- [Git](https://git-scm.com/downloads)

### How to run the development build
1. Clone the project and change the directory via
```bash
git clone https://github.com/4KSHAT0p/reminis.git
cd reminis
```

2. Install dependencies
```bash
npx expo install
```

3. Start the development server
```bash
npx expo start
```

4. Generate a development build. *(refer to the instructions below)*

5. Connect an android *(>10)* device with usb debugging enabled.

6. Press 'a' to open on the android device.
   
![image](https://github.com/user-attachments/assets/7dd216aa-9375-4791-bc06-c0352fc903c3)

## How to generate development/ production builds:
**We will need to rebuild again if:**

1. We added/removed/updated native modules (like expo-notifications, react-native-maps, etc.)

2. We changed something in android/, ios/, or app.json that affects native config

3. We're upgrading Expo SDK version

4. We want to publish a new .apk or .aab for Play Store submission

5. A new user can rebuild the application by the following commands

```bash
npx expo install expo-dev-client
```
```bash
npm install -g eas-cli
```   
Go to https://expo.dev to create a free account

```bash
eas login
```
Enter your email and password to login.

Then initialize EAS via:
```bash
eas init
```

For development build:
```bash
eas build --platform android --profile development
```
```bash
npx expo start
```

For production build (.aab file for publishing the app on Play Store)
```bash
eas build --platform android --profile production
```

*Note:* To build a production .apk change the eas.json file's production block as:

```bash
    "production": {
      "android": {
        "buildType": "apk"
      }
    }

```
