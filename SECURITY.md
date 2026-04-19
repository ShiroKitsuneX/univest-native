# UniVest Security Guidelines

## Sensitive Files (Never Commit)

These files contain secrets and should NEVER be committed:

- `.env` - Environment variables with API keys
- `GoogleService-Info.plist` - Firebase iOS credentials
- `android/app/*.json` - Firebase Android credentials
- `*.keystore` - Android signing keys
- `*.p12` - iOS certificates

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your Firebase credentials
3. Do not commit `.env`

## Rules

- Never hardcode API keys in source code
- Use environment variables for secrets
- Never commit credentials to git
- Rotate API keys periodically
- Use Firebase Security Rules for database

## Firebase Setup

1. Go to Firebase Console
2. Create project or use existing
3. Add iOS/Android app
4. Download config files
5. Place in project root (add to .gitignore)
6. Reference via environment variables