# Database Connection Guide

This guide explains how to use both your **Local Database** (for development) and your **Cloud Database** (for deployment).

## 1. Local Database (Development)
**Use this when:** You are coding on your laptop and testing features.

### How to Start
1.  Open the `server` folder.
2.  Open a terminal/PowerShell here.
3.  Type **`npm run dev`** and press Enter.
4.  **Keep the window open.** This is your server.

### Configuration (`server/.env`)
Your `.env` file should look like this for local work:
```ini
MONGO_URI=mongodb://127.0.0.1:27017/usj-pool-local
```

---

## 2. Cloud Database (Production)
**Use this when:** You deploy to Vercel, or if you want to test the real live data from your computer.

### Configuration
To test the cloud DB locally, change your `.env` file:
```ini
# Comment out the local one
# MONGO_URI=mongodb://127.0.0.1:27017/usj-pool-local

# Use the Cloud String (Password included)
MONGO_URI=mongodb+srv://tharindu:wC7K0N0a3tfdkhwu@poolmanagementsystem.whocug5.mongodb.net/pool-management?appName=PoolManagementSystem
```

> [!CAUTION]
> **Be careful!** If you connect to the Cloud DB locally, any users or bookings you delete are **really gone** from the live website.

---

## Summary
| Environment | Connection Type | Connection String | Action Required |
| :--- | :--- | :--- | :--- |
| **Local PC** | Local MongoDB | `mongodb://127.0.0.1:27017...` | Run `start_db.ps1` |
| **Vercel** | Cloud Atlas | `mongodb+srv://tharindu:...` | Set Env Variable in Vercel |
