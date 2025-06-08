# ReMiniS

ReMiniS is a React Native app that lets users capture moments by taking photos and tagging them with their current GPS location. The app demonstrates the use of native Android SDK features like camera, location, background services & notifications.

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/aff37a35-69f9-46db-b6af-9f7d1bd9c58c" width="20%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/2770d22f-8a40-4518-9a4c-97621e3b3e01" width="20%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/56ce72f9-2041-431d-9ccb-8b1b5fa5731a" width="20%" style="margin-right: 10px;" />
  <img src="https://github.com/user-attachments/assets/2b63168e-7448-498c-b9a2-ebaf235209b2" width="20%" />
</p>
<br>

## Installation for general use

Download apk from [here](https://drive.google.com/file/d/1xHymFlJXJjDuv0fcd76mvR84Pe8eFs3V/view?usp=sharing).


<br>

## Installation for local development

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
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Download the development build apk from [here.](https://drive.google.com/file/d/1R_RTMdmRU_Uqt1xMxHMVk1LeM4Na0NZB/view?usp=sharing)

5. Connect an android *(>10)* device with usb debugging enabled.

6. Press 'a' to open on the android device.
   
![image](https://github.com/user-attachments/assets/7dd216aa-9375-4791-bc06-c0352fc903c3)

### Note:
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
