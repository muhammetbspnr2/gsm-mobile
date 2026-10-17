# GSM Takip — GitHub Pages

Site: https://muhammetbspnr2.github.io/gsm-mobile/  
Admin: https://muhammetbspnr2.github.io/gsm-mobile/admin.html  
Realtime Database: https://spu-personal-default-rtdb.firebaseio.com/

## Setup before use
1. In Firebase Console, open the project that owns the database URL.
2. Authentication > Sign-in method: enable Email/Password.
3. Project settings > Your apps > Web app: copy the Web App config.
4. Edit firebase-config.js and replace every BURAYA_ placeholder with the actual values. The databaseURL is already set.
5. Realtime Database > Rules: publish database.rules.json.
6. Register the trusted admin on the public site. In Authentication > Users, copy that user's UID. In Realtime Database, set /admins/UID to boolean true.
7. Ensure muhammetbspnr2.github.io is an authorized domain in Firebase Authentication.
8. Test registration, login, admin approval and site creation.

## Security
- Never upload a Firebase service-account private key.
- Web config is not a server secret; access is enforced by Realtime Database Rules.
- This build uses Firebase Authentication, not a hard-coded admin/admin password.
- Users sign in with email; the generated GSM username is displayed in their profile.
- GPS needs HTTPS and browser permission. Automatic province/district lookup is not included.
- The six-month password age reminder is client-side only; strict enforcement needs trusted backend logic.
