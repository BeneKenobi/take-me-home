# take-me-home
[![CodeQL](https://github.com/BeneKenobi/take-me-home/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/BeneKenobi/take-me-home/actions/workflows/codeql-analysis.yml)
[![Build dev-container](https://github.com/BeneKenobi/take-me-home/actions/workflows/build-dev-container.yml/badge.svg)](https://github.com/BeneKenobi/take-me-home/actions/workflows/build-dev-container.yml)[![Expo Publish](https://github.com/BeneKenobi/take-me-home/actions/workflows/expo-publish.yml/badge.svg)](https://github.com/BeneKenobi/take-me-home/actions/workflows/expo-publish.yml)

An app to calculate the time it takes to get home. Written in React(-Native). Created for the course **Web Technologien** at the [FOM Hochschule](https://www.fom.de/) by [@BeneKenobi](https://github.com/BeneKenobi) and [@Mekcyed](https://github.com/Mekcyed).


You can easily checkout the latest version of branch `main` on your own device at https://expo.dev/@benekenobi/take-me-home or in your browser at https://benekenobi.github.io/take-me-home/.

## process overview

![prozess_ueberblick](https://github.com/BeneKenobi/take-me-home/raw/main/docs/prozess_ueberblick-mmd.png)

## short developer intro

### install/update dependencies

```Shell
yarn install
```

### run

```Shell
yarn start
```

### dependencies / dev container

You can use a precompiled [dev-container](https://code.visualstudio.com/docs/remote/containers) in [Visual Studio Code](https://code.visualstudio.com/) that already includes all dependencies.

### Google Maps API Key

create a file called `.env` in your root directory and fill with

```Shell
GOOGLE_API_KEY_WEB="web_api_key"
GOOGLE_API_KEY_IOS="ios_api_key"
GOOGLE_API_KEY_ANDROID="android_api_key"
```

### upgrade expo packages

```Shell
expo upgrade
```
