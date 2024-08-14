# Introduction

This is the companion repository to the Dev Up 2024 talk "Microsoft Graph API Deep Dive"

# Demo App

## App Registration

In order to use this applicaton, you will need to register an app in the Microsoft Identity platform
You will either need to be an admin for your O365 tenant or have your administrator register the app for you
Please see slides in the App Registration section in the presentation

## Configuring the web application

- cd to the demo-app directory
- Copy or rename the .env.sample to .env.local
- Use the information collected during App Registration to fill in the AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET and AZURE_AD_TENANT_ID in the .env.local
- You will also need to use openssl to generate a secret for the NEXTAUTH_SECRET environment variable
- Pay close attention to the AZURE_AD_SCOPES. You will need openid, profile, email and offline_access in addition to listing all the scopes that you configured during App Registration

## Running the app

```
> cd demo-app
> npm install
> npm run dev
Browse to http://localhost:3000
```
