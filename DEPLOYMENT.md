# Deployment Guide - Tracking Performance App

## Problemet e Zakonshme dhe Zgjidhjet

### 1. Environment Variables në Vercel

Duhet të vendosni environment variables në Vercel Dashboard për të dy projektet:

#### Frontend (tracking-app) - Environment Variables:
```
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### Backend (Backend) - Environment Variables:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### 2. Si të vendosni Environment Variables në Vercel:

1. Shkoni te Vercel Dashboard
2. Zgjidhni projektin tuaj
3. Shkoni te **Settings** → **Environment Variables**
4. Shtoni çdo variabël siç tregohet më lart
5. **IMPORTANT**: Sigurohuni që të zgjidhni **Production**, **Preview**, dhe **Development** për çdo variabël
6. Bëni **Redeploy** të projektit pasi të shtoni variablat

### 3. Build Process

#### Frontend:
- Vercel automatikisht do të ekzekutojë `npm run build` (siç është konfiguruar në `vercel.json`)
- Output do të jetë në folder `dist/`
- Vercel do të shërbejë file-at statike nga `dist/`

#### Backend:
- Vercel do të ekzekutojë build për serverless functions
- `api/index.js` do të jetë entry point për backend

### 4. Deployment Steps:

1. **Deploy Backend së pari:**
   - Push kodin në GitHub
   - Në Vercel, krijo një projekt të ri për `Backend` folder
   - Vendos environment variables për backend
   - Deploy

2. **Merr URL-në e Backend:**
   - Pas deploy, merr URL-në e backend (p.sh. `https://backend-name.vercel.app`)
   - Përdore këtë URL në `VITE_API_URL` për frontend

3. **Deploy Frontend:**
   - Në Vercel, krijo një projekt të ri për `tracking-app` folder
   - Vendos environment variables për frontend (duke përdorur URL-në e backend)
   - Deploy

4. **Update Backend FRONTEND_URL:**
   - Pas deploy të frontend, merr URL-në e frontend
   - Update `FRONTEND_URL` në backend environment variables
   - Bëni redeploy të backend

### 5. Verifikimi i Deployment:

#### Frontend:
- Shkoni te URL e frontend
- Hapni Developer Console (F12)
- Kontrolloni nëse ka errors për `VITE_API_URL`

#### Backend:
- Shkoni te `https://your-backend.vercel.app/`
- Duhet të shihni: `{"message":"Tracking Performance API is running"}`
- Testoni endpoint: `https://your-backend.vercel.app/api/auth/...`

### 6. Problemet e Zakonshme:

#### Problem: "VITE_API_URL is not defined"
**Zgjidhje**: Vendos `VITE_API_URL` në Vercel Environment Variables dhe bëj redeploy

#### Problem: "CORS Error"
**Zgjidhje**: Sigurohuni që `FRONTEND_URL` në backend është i vendosur saktë dhe përputhet me URL-në e frontend

#### Problem: "MONGODB_URL is not defined"
**Zgjidhje**: Vendos `MONGODB_URL` në Vercel Environment Variables për backend

#### Problem: "Build fails"
**Zgjidhje**: 
- Kontrollo logs në Vercel Dashboard
- Sigurohuni që të gjitha dependencies janë në `package.json`
- Kontrollo që `npm run build` funksionon lokal

#### Problem: "404 Not Found" për routes
**Zgjidhje**: 
- Për frontend: `vercel.json` duhet të ketë rewrites për SPA routing
- Për backend: Kontrollo që routes janë të konfiguruara saktë

### 7. Tips:

- **Gjithmonë deploy backend së pari**, pastaj frontend
- **Përdor preview deployments** për të testuar para se të deploy në production
- **Kontrollo logs** në Vercel Dashboard për errors
- **Test lokal** me `npm run build` para deployment
- **Sigurohuni që MongoDB Atlas** ka IP whitelist të konfiguruar (ose lejo të gjitha IPs për testing)

### 8. MongoDB Atlas Setup:

**Mund të përdorësh të njëjtën database që ke pasur më parë!** Ose mund të krijosh një të re:

#### Opsioni 1: Përdor Database Ekzistuese
1. Shkoni te [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Hyni në cluster-in ekzistues
3. Merr connection string (nëse nuk e ke më)
4. Whitelist IP addresses:
   - Shto `0.0.0.0/0` për të lejuar të gjitha IPs (ose shto IP të Vercel)
   - Ose përdor Network Access për të lejuar Vercel IPs
5. Vendos `MONGODB_URL` në Vercel environment variables

#### Opsioni 2: Krijo Database të Re
1. Krijo një cluster të ri në MongoDB Atlas
2. Krijo një database user me username dhe password
3. Whitelist IP addresses: `0.0.0.0/0` (për të lejuar të gjitha)
4. Merr connection string dhe vendose në `MONGODB_URL`

**Shënim**: Nëse përdor database të re, të gjitha të dhënat e vjetra nuk do të jenë aty. Nëse dëshiron të ruash të dhënat, përdor database ekzistuese.

### 9. Google OAuth Setup:

**Mund të përdorësh Google OAuth credentials që ke pasur më parë!** Thjesht duhet t'i përditësosh:

1. Shkoni te [Google Cloud Console](https://console.cloud.google.com/)
2. Zgjidhni projektin tuaj ekzistues (ose krijo një të ri)
3. Shkoni te **APIs & Services** → **Credentials**
4. Gjej OAuth 2.0 Client ID që ke pasur më parë
5. **Shto ose përditëso Authorized redirect URIs:**
   - Development: `http://localhost:5000/api/auth/google/callback` (ose port që përdor lokal)
   - Production: `https://your-backend.vercel.app/api/auth/google/callback`
   - **IMPORTANT**: Duhet të shtosh URL-në e backend në production!

6. **Environment Variables që duhen:**
   - **Frontend**: `VITE_GOOGLE_CLIENT_ID` = Google Client ID (i njëjtë që ke pasur)
   - **Backend**: 
     - `GOOGLE_CLIENT_ID` = Google Client ID (i njëjtë)
     - `GOOGLE_CLIENT_SECRET` = Google Client Secret (i njëjtë që ke pasur)

**Shënim**: Nëse nuk i ke më Client ID dhe Secret, duhet t'i krijosh të reja në Google Cloud Console.

---

**Nëse keni probleme, kontrolloni:**
1. Vercel Deployment Logs
2. Browser Console për frontend errors
3. Network tab për API requests
4. Environment Variables në Vercel Dashboard

