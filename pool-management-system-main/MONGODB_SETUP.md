# How to Configure MongoDB Atlas (Cloud Database)

Since your local MongoDB is not running, using MongoDB Atlas (the free cloud version) is a great alternative. Follow these steps:

## 1. Create an Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up for a free account.

## 2. Create a Cluster
1. Once logged in, click **"Build a Database"**.
2. Select **"M0" (Free)** tier.
3. Choose a provider (AWS) and region closest to you (e.g., Singapore or India).
4. Click **"Create"**.

## 3. Create a Database User
1. You will be asked to set up a "Username and Password".
2. **Username**: `admin` (or whatever you prefer).
3. **Password**: Create a secure password (avoid special characters like `@` or `/` initially to prevent URI parsing issues, or URL-encode them).
4. **IMPORTANT**: Click **"Create User"**.
5. **IMPORTANT**: Save this password! You will need it in the next step.

## 4. Network Access (Allow your IP)
1. On the "Network Access" step (or sidebar menu).
2. Click **"Add IP Address"**.
3. Select **"Allow Access from Anywhere"** (`0.0.0.0/0`) for development simplicity.
4. Click **"Confirm"**.

## 5. Get Connection String
1. Go back to the **"Database"** overview.
2. Click the **"Connect"** button on your Cluster.
3. Select **"Drivers"** (Node.js).
4. You will see a string like:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

## 6. Update Your Project
1. Copy that connection string.
2. Replace `<username>` and `<password>` with the credentials you created in Step 3.
3. Open `server/.env` in your project.
4. Replace the existing `MONGO_URI` with your new Atlas string.

```env
MONGO_URI=mongodb+srv://admin:yourpassword123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

## 7. Restart Server
1. Stop the backend server (`Ctrl + C`).
2. Run `npm run dev` again.
3. You should see "MongoDB Connected" in the terminal.
