# כלכוליטור

אפליקציית ווב פשוטה למעקב אחר הוצאות בין 5 שותפים: יאמא, אלירן, ריהוט גן, אורן, משה.
לכל רשומה: שם, סכום ותיאור. בתחתית מוצג סיכום כמה כל שותף הכניס וסה"כ כללי.
הנתונים נשמרים ומתעדכנים בזמן אמת ב-Firebase (Firestore), כך שהם משותפים לכל מי שפותח את הדף.

## הקמת פרויקט פיירבייס (חד פעמי, כ-5 דקות)

1. גשו ל-https://console.firebase.google.com והתחברו עם חשבון Google.
2. לחצו על "Add project" / "הוספת פרויקט", תנו שם (למשל `calcolitor`), ואפשר לבטל את Google Analytics (לא נדרש).
3. בתפריט הצד, היכנסו ל-**Build > Firestore Database**, ולחצו "Create database".
   - בחרו מיקום (region) קרוב, למשל `europe-west1`.
   - בשלב חוקי האבטחה, לצורך התחלה מהירה בחרו **Test mode** (זמין ל-30 יום, מאפשר קריאה/כתיבה חופשית). בסוף המדריך יש הצעה לחוקים קבועים.
4. בתפריט הצד לחצו על גלגל השיניים ליד "Project Overview" > **Project settings**.
5. גללו למטה ל-"Your apps", לחצו על סמל ה-Web `</>`, תנו כינוי לאפליקציה (למשל `calcolitor-web`), ואין צורך ב-Firebase Hosting בשלב הזה.
6. תופיע בפניכם אובייקט `firebaseConfig` עם ערכים כמו `apiKey`, `authDomain` וכו'. העתיקו את הערכים האלה.

## חיבור האפליקציה

1. פתחו את הקובץ [firebase-config.js](firebase-config.js) בתיקיית הפרויקט.
2. הדביקו את הערכים שהעתקתם מפיירבייס במקום הטקסט "הדבק כאן...", כך:

```js
const firebaseConfig = {
  apiKey: "AIzaSyD-...",
  authDomain: "calcolitor-12345.firebaseapp.com",
  projectId: "calcolitor-12345",
  storageBucket: "calcolitor-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

3. שמרו את הקובץ.

## הרצת האפליקציה

הכי פשוט: לחצו קליק ימני על [index.html](index.html) ופתחו אותו בדפדפן (או גררו אותו לחלון דפדפן פתוח).

אם הדפדפן חוסם את הטעינה (לעיתים קורה עם קבצים מקומיים), הריצו שרת מקומי קטן מתוך תיקיית הפרויקט:

```
npx serve .
```

ואז פתחו את הכתובת שתופיע (בדרך כלל http://localhost:3000).

## שיתוף עם אחרים

כדי שכל השותפים יוכלו להיכנס מהטלפון/מחשב שלהם, אפשר להעלות את התיקייה כאתר חינמי עם Firebase Hosting:

```
npm install -g firebase-tools
firebase login
firebase init hosting   # לבחור את הפרויקט שיצרתם, public directory = תיקייה הנוכחית, single-page app = No
firebase deploy
```

בסיום תקבלו קישור ציבורי (כמו `https://calcolitor-12345.web.app`) שאפשר לשלוח לכולם.

## אבטחה (מומלץ לעשות בהמשך)

מצב ה-Test mode מאפשר לכל מי שיש לו את הכתובת לקרוא ולכתוב לנתונים, וזה נחסם אוטומטית אחרי 30 יום. כשמוכנים, אפשר להגדיר חוקים קבועים ב-Firestore (Build > Firestore Database > Rules) כמו:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, write: if true; // פתוח לכולם - מתאים לשימוש משפחתי פרטי בלבד
    }
  }
}
```

לאבטחה טובה יותר (מומלץ אם הקישור ציבורי לגמרי) אפשר להוסיף התחברות עם Firebase Authentication - זה שינוי נוסף שאפשר לבצע בהמשך אם תרצו.
