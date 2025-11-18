# 🎓 KFUPM Chatbot - GitHub Pages Deployment

**Simple Web-Based Deployment - No Terminal Skills Required!**

---

## ✅ What Gets Uploaded to GitHub (Only 500 KB!)

These small files only:
- ✅ `index.html` (15 KB) - Chat interface
- ✅ `admin.html` (15 KB) - Admin dashboard
- ✅ `css/style.css` (30 KB) - Styling
- ✅ `js/chat.js` (15 KB) - JavaScript

**Total Size: ~500 KB**

---

## ❌ What NEVER Leaves Your Computer

- ❌ `allam_model/` (30 GB) - **Stays local forever**
- ❌ `app.py` and backend - **Stays local**
- ❌ Python, model, GPU - **All stay local**

**The 30GB model NEVER gets uploaded anywhere!**

---

## 🏗️ How It Works

```
User visits GitHub Pages
        ↓
Loads HTML/CSS/JS in browser (500 KB download)
        ↓
User types message
        ↓
Browser sends request through Cloudflare tunnel
        ↓
Your local machine processes with ALLaM model
        ↓
Response goes back to user
```

**Model stays on your machine, only processes requests!**

---

## 🚀 Deployment Steps (5 Minutes)

### Step 1: Create GitHub Repository (Web Browser)

1. Go to https://github.com/new
2. **Repository name**: `kfupm-chatbot`
3. **Public** ✓
4. Click **"Create repository"**

---

### Step 2: Upload Frontend Files (Web Browser)

On the GitHub repository page:

1. Click **"uploading an existing file"**
2. **Drag and drop** or select these files from `/home/shared_dir/kfupm-frontend/`:
   - `index.html`
   - `admin.html`
   - `.gitignore`

3. Click **"Commit changes"**

4. Click **"Add file" → "Create new file"**
   - Filename: `css/style.css`
   - Copy content from `/home/shared_dir/kfupm-frontend/css/style.css`
   - Click **"Commit changes"**

5. Click **"Add file" → "Create new file"**
   - Filename: `js/chat.js`
   - Copy content from `/home/shared_dir/kfupm-frontend/js/chat.js`
   - Click **"Commit changes"**

---

### Step 3: Enable GitHub Pages (Web Browser)

1. Go to **Settings** tab in your repository
2. Click **"Pages"** in left sidebar
3. Under "Source":
   - Branch: **main** (or master)
   - Folder: **/ (root)**
4. Click **"Save"**

**Wait 1-2 minutes**

Your site will be live at:
```
https://YOUR_USERNAME.github.io/kfupm-chatbot/
```

---

### Step 4: Run Cloudflare Tunnel (One Command on Your Computer)

Open terminal and run:

```bash
cd /home/shared_dir/kfupm-frontend
./cloudflared tunnel --url http://localhost:5000
```

**Output will show:**
```
Your quick Tunnel has been created! Visit it at:
https://abc-random-words-123.trycloudflare.com
```

**→ Copy this URL** (you'll need it in Step 5)

**→ Keep this terminal running!**

---

### Step 5: Configure API URL (Web Browser)

Go back to your GitHub repository:

#### Edit `js/chat.js`:

1. Click on `js/chat.js`
2. Click the **pencil icon** (Edit)
3. Find lines 9-15:
   ```javascript
   const API_CONFIG = {
       baseUrl: window.location.hostname === 'localhost' 
           ? 'http://localhost:5000'
           : 'YOUR_BACKEND_URL_HERE',
       
       apiKey: 'YOUR_API_KEY_HERE'
   };
   ```

4. Replace with:
   ```javascript
   const API_CONFIG = {
       baseUrl: window.location.hostname === 'localhost' 
           ? 'http://localhost:5000'
           : 'https://abc-random-words-123.trycloudflare.com',  // Your URL from Step 4
       
       apiKey: 'kfupm-chatbot-secure-api-key-2024'
   };
   ```

5. Click **"Commit changes"**

#### Edit `admin.html`:

1. Click on `admin.html`
2. Click **pencil icon** (Edit)
3. Find similar `API_CONFIG` section (around line 278)
4. Make the **SAME changes** as above
5. Click **"Commit changes"**

---

## 🎉 DONE! Your Chatbot is Live!

Visit:
```
https://YOUR_USERNAME.github.io/kfupm-chatbot/
```

**Share this URL with anyone!** They can use your chatbot from anywhere in the world! 🌍

Admin dashboard:
```
https://YOUR_USERNAME.github.io/kfupm-chatbot/admin.html
```

---

## 📊 What Runs Where

| Component | Location | Size | Upload |
|-----------|----------|------|--------|
| **HTML/CSS/JS** | GitHub Pages | 500 KB | ✅ Yes |
| **ALLaM Model** | Your Computer | 30 GB | ❌ NO |
| **Python Backend** | Your Computer | 50 MB | ❌ NO |
| **Cloudflare Tunnel** | Free Service | 40 MB | ❌ Just runs |

**Only the tiny frontend (500 KB) gets uploaded!**

---

## 🔄 Daily Usage

### Start Your Backend (Once When You Boot Computer)

```bash
# Terminal 1: Start backend
cd /home/shared_dir/chatbot
./run.sh

# Terminal 2: Start tunnel
cd /home/shared_dir/kfupm-frontend
./cloudflared tunnel --url http://localhost:5000
```

**Keep both running** while you want the chatbot to be accessible.

### Users Access

They just visit your GitHub Pages URL - no setup needed on their end!

---

## 🛠️ Making Updates

### Update Frontend (Chat UI):
1. Edit files locally
2. Upload changed file to GitHub via web
3. Changes go live in 1-2 minutes

### Update Backend (Model/Logic):
1. Edit files locally
2. Restart backend: `cd /home/shared_dir/chatbot && ./run.sh`
3. No GitHub upload needed

---

## 💡 Understanding the Setup

**Think of it like a website with a database:**

- **GitHub Pages** = Your website (HTML/CSS/JS)
- **Your Computer** = Your database server
- **Cloudflare** = The secure connection between them

You upload the **website** to GitHub, but the **database** (in your case, the AI model) stays on your computer and answers questions through the tunnel.

**This is normal and secure!** Millions of websites work this way.

---

## 🎯 Summary

**What Gets Uploaded**: 4 tiny text files (HTML/CSS/JS) = 500 KB
**What Stays Local**: The big AI model = 30 GB
**How They Connect**: Cloudflare tunnel (free, secure)
**Total Cost**: $0/month
**Your Role**: Keep 2 terminals running when you want chatbot accessible

---

## 🆘 Common Questions

**Q: Do I need to upload the model to GitHub?**
A: NO! Never. Only HTML/CSS/JS files.

**Q: Will GitHub charge me for the 30GB model?**
A: NO! You're not uploading it.

**Q: What happens when I turn off my computer?**
A: The chatbot stops working (model isn't running). Turn it back on and run the 2 commands again.

**Q: Can I close the cloudflare tunnel?**
A: Not if you want the chatbot accessible. Keep it running.

**Q: Is this secure?**
A: Yes! API key authentication + HTTPS encryption.

---

**Ready to go live! Follow the 5 steps above.** 🚀