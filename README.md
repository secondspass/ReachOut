# ReachOut

A React Native app that helps you keep track of when to reach out to your friends based on custom time intervals.

Currently only tested for Android

Mostly written by AI. I can't really claim credit for this. I've wanted something like this for a
while and this made it a lot easier to put together.

## Features

- **Friend Management**: Add friends with custom contact methods and reminder frequencies
- **Backup & Restore**: Export your friend data to JSON files and restore from backups



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




# TODOs
- [x] refactor to use Stacks. Add the settings page in a Stack page
- [x] put back up and restore in a Modal in the settings Stack page
- [x] adjust text box size for custom number of days optional
- [x] change logo of backup restore option to something that communicates that it is backup/restore
- [ ] change app icon to something that is CC licensed or public domain
- [x] update view (update all the countdowns) every time the app is brought to foreground (currently it only updates when you restart, or you press some button within the app) (use https://reactnative.dev/docs/appstate)
- [x] change name to ReachOut
- [x] use this stackoverflow https://stackoverflow.com/a/61975683 to rerender the main page when
  returning from backup and restore
- [x] change route.navigate to Link to go to settings page
- [ ] add feature to set the first contact date and then contact at a regular recurrence after that
- [ ] redo datetimepicker by hand
- [ ] add logo to left of header
- [ ] add search function that will quickly filter list as you type
- [ ] add tests

