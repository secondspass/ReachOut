# Friend Reminder App

A React Native app that helps you keep track of when to reach out to your friends based on custom time intervals.

Currently only tested for Android

Mostly written by AI. I can't really claim credit for this.

## Features

- **Friend Management**: Add friends with custom contact methods and reminder frequencies
- **Smart Reminders**: See who you need to contact and when
- **Backup & Restore**: Export your friend data to JSON files and restore from backups
- **Cross-Platform**: Works on Android, iOS, and web


## Backup Feature

The app includes a comprehensive backup system that allows you to:

### Export Data
- Tap the ⚙️ settings icon in the top-right corner
- Select "Export Backup" to create a JSON backup file
- Share the backup file via email, cloud storage, or save locally
- Backup includes all friend data: names, contact methods, frequencies, and last contact dates

### Import Data
- Tap the ⚙️ settings icon and select "Import Backup"
- Choose a previously exported backup file
- All current data will be replaced with the backup data
- A confirmation dialog will show backup details before importing

### Backup File Format
- Files are saved in JSON format with `.json` extension
- Includes version information and timestamp
- Can be opened in any text editor for manual inspection
- Compatible across different devices and platforms

# Development
## Getting Started

Using Expo as my react native framework

install watchman (`sudo apt install watchman`) and android studio. Follow steps in https://docs.expo.dev/get-started/create-a-project/ and https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local

Make sure your phone has USB debugging turned on, and is visible in `adb devices` when you plug it into your computer. You need the phone plugged in for Expo to install it.
`npx expo run:android` installs and starts the android app over usb.
`npx expo start --web` starts the web version

## Step 1: Install dependencies
```
npm install
```

## Step 2: Run Expo build server

```
npx expo run:android
# or for installing non-debug app
npx expo run:android --variant release
```

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Modify the files under the `app` directory. Those are the source files.The development server will
detect the changes automatically and reload.


When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Step 4 (optional): Clean up to refresh assets (in case your changes aren't loading properly)

In case the live reloading isn't working, its likely because the assets are being placed over the
older ones and as a result we're seeing unexpected behavior.

To delete the old builds
```
npx expo prebuild --clean
```

Then start the development server/install the app again
```
npm expo run:android --variant release
```

## Step 5 (optional): Generate an APK file



# TODOs
- [ ] refactor to use Stacks. Add the settings page in a Stack page
- [ ] put back up and restore in a Modal in the settings Stack page
- [ ] adjust text box size for custom number of days optional
- [ ] push to github
