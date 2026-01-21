# Running the App on Physical Device

## Prerequisites

1. **Enable Developer Options** on your phone
2. **Enable USB Debugging**
3. **Connect phone via USB** or ensure both devices are on the same WiFi network
4. **Start your backend API server** (make sure it's running on port 3000)

---

## For Android Physical Device

### Step 1: Enable Developer Options & USB Debugging

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (you'll see "You are now a developer!")
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB** (if available)

### Step 2: Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
```
Look for `IPv4 Address` under your active network adapter (usually WiFi or Ethernet)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for `inet` address (usually starts with 192.168.x.x or 10.x.x.x)

**Example:** `192.168.1.100`

### Step 3: Update API Configuration

Edit `mobile/src/services/api.ts` and change the API URL:

```typescript
// Change from:
return 'http://10.0.2.2:3000'; // Emulator only

// To your computer's IP:
return 'http://192.168.1.100:3000'; // Replace with YOUR IP
```

Or create a config file to easily switch:

**Option A: Simple - Edit api.ts directly**
```typescript
const getApiBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            // Change this to your computer's IP for physical device
            return 'http://192.168.1.100:3000'; // ← YOUR IP HERE
        }
        return 'http://localhost:3000';
    }
    return 'https://api.yourdomain.com';
};
```

**Option B: Use Environment Variables (Recommended)**

1. Install `react-native-config`:
```bash
npm install react-native-config
```

2. Create `.env` file in `mobile/`:
```
API_URL=http://192.168.1.100:3000
```

3. Update `api.ts` to use it:
```typescript
import Config from 'react-native-config';
const API_BASE_URL = Config.API_URL || 'http://10.0.2.2:3000';
```

### Step 4: Connect Your Phone

**Via USB:**
1. Connect phone to computer via USB cable
2. On your phone, when prompted, allow USB debugging
3. Verify connection:
```bash
cd mobile/android
adb devices
```
You should see your device listed

**Via WiFi (Wireless Debugging - Android 11+):**
1. Connect phone and computer to same WiFi
2. On phone: Settings → Developer Options → Wireless debugging
3. Enable "Wireless debugging"
4. Note the IP address and port shown
5. On computer:
```bash
adb connect <phone-ip>:<port>
```

### Step 5: Build and Install

**Method 1: Using React Native CLI (Recommended)**
```bash
cd mobile
npm start
# In another terminal:
npm run android
```

**Method 2: Build APK and Install Manually**
```bash
cd mobile/android
./gradlew assembleDebug
# APK will be in: mobile/android/app/build/outputs/apk/debug/app-debug.apk
# Transfer to phone and install
```

### Step 6: Configure Firewall (If API Not Accessible)

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature"
3. Allow Node.js or your backend server through firewall
4. Or allow port 3000 specifically

**Mac Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add your Node.js/backend app

---

## For iOS Physical Device

### Step 1: Apple Developer Account

You need:
- Apple Developer Account (free for development, $99/year for App Store)
- Xcode installed on Mac
- iOS device connected via USB

### Step 2: Configure Xcode

1. Open `mobile/ios/StoreManagement.xcworkspace` in Xcode
2. Select your device from the device dropdown
3. Go to **Signing & Capabilities**
4. Select your **Team** (your Apple ID)
5. Xcode will automatically create a provisioning profile

### Step 3: Update API Configuration

Edit `mobile/src/services/api.ts`:

```typescript
const getApiBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'ios') {
            // For physical iOS device, use your Mac's IP
            return 'http://192.168.1.100:3000'; // ← YOUR MAC'S IP
        }
        return 'http://localhost:3000';
    }
    return 'https://api.yourdomain.com';
};
```

### Step 4: Configure Network Security (iOS)

iOS blocks HTTP by default. You need to allow it:

1. Open `mobile/ios/StoreManagement/Info.plist`
2. Add this before `</dict>`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

Or for production, only allow your specific domain:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>192.168.1.100</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### Step 5: Build and Run

```bash
cd mobile
npm start
# In another terminal:
npm run ios
```

Or in Xcode:
1. Select your device
2. Click the Play button (▶️)

---

## Troubleshooting

### "Network request failed" or "Connection refused"

1. **Check IP Address:** Make sure you're using the correct IP
2. **Same Network:** Phone and computer must be on same WiFi
3. **Firewall:** Allow port 3000 through firewall
4. **Backend Running:** Ensure your API server is running
5. **Test Connection:** On your phone's browser, try: `http://YOUR_IP:3000/health` (if you have a health endpoint)

### "Unable to connect to development server"

1. **Shake device** → "Settings" → Enter your computer's IP and port 8081
2. Or run:
```bash
adb reverse tcp:8081 tcp:8081  # Android only
```

### Android: "Installation failed" or "App not installed"

1. Enable "Install from Unknown Sources" in Settings
2. Uninstall any previous version first
3. Check if device has enough storage

### iOS: "Untrusted Developer"

1. Settings → General → VPN & Device Management
2. Trust your developer certificate

### Can't find device in `adb devices`

1. Check USB cable (use data cable, not charging-only)
2. Try different USB port
3. Re-enable USB debugging
4. Install/update USB drivers (Windows)

---

## Quick Reference

### Switch Between Emulator and Physical Device

**For Emulator:**
```typescript
return 'http://10.0.2.2:3000'; // Android
return 'http://localhost:3000'; // iOS
```

**For Physical Device:**
```typescript
return 'http://192.168.1.100:3000'; // Replace with YOUR IP
```

### Useful Commands

```bash
# Check connected devices
adb devices

# View device logs
adb logcat

# Restart Metro bundler
cd mobile
npm start -- --reset-cache

# Clear app data (Android)
adb shell pm clear com.vstock.management
```

---

## Production Build

For production, you'll want to:
1. Use HTTPS instead of HTTP
2. Point to your production API URL
3. Build release APK/IPA
4. Sign with production certificates

See React Native documentation for production builds.
