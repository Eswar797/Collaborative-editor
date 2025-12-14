# Troubleshooting Guide

## Issue: Can't see anything on the website

### Step 1: Check if servers are running

Open two terminal windows:

**Terminal 1 - Start the backend server:**
```bash
cd server
npm run dev
```
You should see: `Server running on port 3001`

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 2: Open the correct URL

Make sure you're opening: **http://localhost:5173** (not 3001)

### Step 3: Check browser console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Share any errors you see

### Step 4: Clear browser cache

1. Press `Ctrl + Shift + Delete`
2. Clear cached images and files
3. Refresh the page (Ctrl + F5)

### Step 5: Check if ports are in use

If you get "port already in use" errors:

**For port 3001 (server):**
```bash
# Windows PowerShell
netstat -ano | findstr :3001
# Kill the process if needed
taskkill /PID <PID> /F
```

**For port 5173 (client):**
```bash
netstat -ano | findstr :5173
# Kill the process if needed
taskkill /PID <PID> /F
```

### Step 6: Reinstall dependencies

If nothing works, try reinstalling:

```bash
# Delete node_modules
rm -rf node_modules client/node_modules server/node_modules

# Reinstall
npm run install-all
```

### Step 7: Check firewall

Make sure Windows Firewall isn't blocking Node.js

### Common Issues:

1. **Blank white screen**: Usually means JavaScript error - check browser console
2. **Connection refused**: Server not running - start the server first
3. **404 errors**: Wrong URL or dev server not started
4. **Modal not showing**: Check browser console for errors

### Quick Test:

Open browser console and type:
```javascript
console.log('Test');
```

If this works, JavaScript is running. The issue is likely with the React app.

### Still not working?

1. Check that you're in the correct directory: `C:\Users\Eswar Narayana\collaborative`
2. Make sure both `server` and `client` folders exist
3. Verify `package.json` files exist in both folders
4. Try accessing `http://localhost:5173` directly

