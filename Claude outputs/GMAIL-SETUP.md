# Gmail Integration Setup - ATLAS Phase 2

## 📋 Hva trenger du

3 verdier fra Google Cloud Console:
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`  
- `GMAIL_REFRESH_TOKEN`

---

## 🔧 Steg 1: Opprett Google Cloud Prosjekt

1. Gå til: https://console.cloud.google.com
2. Klikk **Create Project**
3. Gi det navn: `ATLAS Gmail Integration`
4. Klikk **Create**

---

## 🔑 Steg 2: Aktiver Gmail API

1. I menyen øverst til venstre, søk etter **Gmail API**
2. Klikk på Gmail API
3. Klikk **ENABLE**

---

## 🎫 Steg 3: Generer OAuth 2.0 Credentials

1. Gå til **APIs & Services** → **Credentials** (venstre meny)
2. Klikk **+ Create Credentials** → **OAuth client ID**
3. Du får spørsmål "OAuth 2.0 Consent Screen required"
4. Klikk **Configure Consent Screen**

### Configure Consent Screen:
- **User Type**: Select "External"
- **App name**: ATLAS Phase 2
- **User support email**: royrotvold@gmail.com
- Scroll ned og klikk **Save and Continue**

### Scopes:
- Klikk **Add or Remove Scopes**
- Søk etter: `gmail.readonly`
- Velg **gmail.readonly**
- Klikk **Update**
- Klikk **Save and Continue**

### Test Users:
- Klikk **Add Users**
- Legg til din egen email (royrotvold@gmail.com)
- Klikk **Save and Continue**
- Klikk **Back to Dashboard**

---

## 🔑 Steg 4: Opprett OAuth Client ID

1. Gå tilbake til **Credentials**
2. Klikk **+ Create Credentials** → **OAuth client ID**
3. **Application type**: Select "Desktop application"
4. **Name**: ATLAS Gmail
5. Klikk **Create**
6. Du får popup med "Client ID created" - klikk **Download** (JSON-fil)

### Fra JSON-filen, kopier disse:
```
"client_id": "xxx.apps.googleusercontent.com"
"client_secret": "xxx"
```

---

## 📝 Steg 5: Legg til CLIENT_ID og CLIENT_SECRET i .env

```bash
nano ~/atlas-phase2/.env
```

Legg til:
```
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxx
```

Lagre (Ctrl+X, Y, Enter)

---

## 🔄 Steg 6: Generer Refresh Token

Kopier scriptet til Mac:

```bash
cp ~/Downloads/get-gmail-token.js ~/atlas-phase2/scripts/
cd ~/atlas-phase2
node scripts/get-gmail-token.js
```

Scriptet vil:
1. Generere en URL
2. Du åpner den og logger inn
3. Du får authorization code
4. Du klistrer den inn i terminalen
5. Du får `GMAIL_REFRESH_TOKEN=...`

Kopier den verdien.

---

## ✅ Steg 7: Legg til Refresh Token i .env

```bash
nano ~/atlas-phase2/.env
```

Legg til:
```
GMAIL_REFRESH_TOKEN=xxx
```

Lagre.

---

## 🚀 Steg 8: Restart API

```bash
# Ctrl+C for å stoppe serveren
bash scripts/03_start-system.sh
```

API'en vil nå kunne lese Gmail-innboksen din! ✅

---

## 🧪 Test Gmail Integration

```bash
curl http://localhost:3000/api/observations
```

Du burde nå se:
```json
{
  "gmail_unread": 5,
  "stripe_recent": [...],
  "timestamp": "..."
}
```

---

**Ferdig!** Gmail-monitoring er nå aktiv 🎉
