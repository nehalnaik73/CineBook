# 📱 CineBook Mobile — React Native (Expo)

Mobile version of the CineBook movie ticket booking app. Uses the same backend as the web app.

---

## 📁 Structure

```
mobile/
├── app/
│   ├── _layout.jsx              # Root layout + auth gate
│   ├── theme.js                 # Design tokens (mirrors web palette)
│   ├── api/axios.js             # Axios with SecureStore token
│   ├── context/AuthContext.jsx  # Auth state
│   ├── components/
│   │   ├── UI.jsx               # Button, Input, Card, Badge, Spinner…
│   │   ├── MovieCard.jsx
│   │   └── SeatGrid.jsx
│   ├── (tabs)/
│   │   ├── _layout.jsx          # Bottom tab bar
│   │   ├── index.jsx            # Home
│   │   ├── movies.jsx           # Browse movies
│   │   └── profile.jsx          # Profile + bookings
│   └── screens/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── MovieDetail.jsx
│       ├── ShowSeats.jsx
│       ├── Payment.jsx
│       ├── Confirmation.jsx
│       └── admin/
│           ├── Dashboard.jsx
│           ├── Movies.jsx
│           ├── Theaters.jsx
│           ├── Shows.jsx
│           └── Bookings.jsx
├── app.json
├── babel.config.js
└── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android) **or** an emulator

---

## 🚀 Setup

```bash
cd movie-booking/mobile
npm install
```

### Set your backend IP

Open `app/api/axios.js` and set `BASE_URL` to your machine's local IP:

```js
// Physical device (find IP via ipconfig / ifconfig)
export const BASE_URL = 'http://192.168.1.10:5000'

// Android emulator
export const BASE_URL = 'http://10.0.2.2:5000'

// iOS simulator
export const BASE_URL = 'http://localhost:5000'
```

> Make sure the backend is running on port 5000 before starting the app.

### Start the app

```bash
npm start          # Opens Expo Dev Tools
npm run android    # Android emulator
npm run ios        # iOS simulator (Mac only)
```

Then scan the QR code with the **Expo Go** app on your phone.

---

## 🔑 Demo Login

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@cinebook.com    | admin123  |
| User  | john@example.com      | user123   |

---

## 🎨 Design

- Dark theme: `#0D0D0D` background, `#1A1A1A` cards, `#E50914` accent
- Mirrors the web Tailwind palette exactly via `app/theme.js`
- Bottom tab navigation: Home · Movies · Profile
- Stack navigation for detail/booking/admin screens

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `expo-secure-store` | Secure JWT storage (replaces localStorage) |
| `expo-linear-gradient` | Hero section gradient |
| `axios` | API calls to Express backend |
| `react-native-qrcode-svg` | QR code on confirmation screen |
| `react-native-svg` | Required by qrcode-svg |

---

## ⚠️ Troubleshooting

**"Network Error" on device**
→ Make sure `BASE_URL` in `app/api/axios.js` points to your machine's LAN IP, not `localhost`.

**Metro bundler issues**
```bash
npx expo start --clear
```

**SecureStore not working in web mode**
→ SecureStore is native only. Use Expo Go or a simulator/emulator.
