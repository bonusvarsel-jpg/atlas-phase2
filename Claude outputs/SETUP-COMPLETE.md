# ATLAS Phase 2 - Complete Setup Guide

Du har nå mottatt alle filene som trengs. Her er steg-for-steg instruksjoner:

## 📋 Filer du har mottatt

1. **setup-backend.sh** - Lager alle backend-filer
2. **package.json** - npm avhengigheter

## 🚀 Installasjonstrinn på Mac

### 1. Forbered prosjektmappen
```bash
cd ~/atlas-phase2
```

### 2. Kopier mottatte filer
- Kopier `setup-backend.sh` → `~/atlas-phase2/scripts/`
- Kopier `package.json` → `~/atlas-phase2/`

### 3. Kjør backend-setup
```bash
bash scripts/setup-backend.sh
```

Output skal være:
```
✅ Directories created
✅ backend/server.js
✅ backend/services/risk-agent.js
✅ backend/services/signal-agent.js
✅ backend/services/gmail.service.js
✅ backend/services/stripe.service.js
✅ backend/services/firebase.service.js
✅ backend/webhooks/bonusvarsel.webhook.js
✅ backend/webhooks/bonusshop.webhook.js

✅✅✅ All backend files created!
```

### 4. Installer npm avhengigheter
```bash
cd ~/atlas-phase2
npm install --legacy-peer-deps
```

### 5. Starta systemet
```bash
bash scripts/03_start-system.sh
```

## ✅ Status

Du burde nå se:
```
✅ Configuration loaded
📊 Initializing ledger database...
✅ Database ready
🌐 Starting API server on port 3000...
```

Deretter API'en kjører på: **http://localhost:3000**

## 🧪 Test API

I et annet terminalvindu:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/observations
curl http://localhost:3000/api/webhooks
```

## 📊 Filstruktur som skal opprettes

```
~/atlas-phase2/
├── backend/
│   ├── server.js                    # Express API
│   ├── services/
│   │   ├── risk-agent.js           # Claude klassifisering
│   │   ├── signal-agent.js         # Signal lagring
│   │   ├── gmail.service.js
│   │   ├── stripe.service.js
│   │   └── firebase.service.js
│   └── webhooks/
│       ├── bonusvarsel.webhook.js
│       └── bonusshop.webhook.js
├── scripts/
│   ├── 01_configure-env.sh         # (allerede kjørt)
│   ├── 03_start-system.sh          # (allerede kjørt)
│   └── setup-backend.sh            # (nå skal kjøres)
├── data/
│   └── ledger/
│       └── atlas.db                # (opprettet av 03_start-system.sh)
├── .env                            # (allerede oppretta og editert)
└── package.json                    # (nå kopiert)
```

## 🔑 API Endepunkter

- `GET /api/health` - Systemstatus
- `GET /api/observations` - Gmail/Stripe snapshot
- `GET /api/webhooks` - Webhook-oversikt
- `POST /webhooks/bonusvarsel/*` - BonusVarsel webhooks
- `POST /webhooks/bonusshop/*` - BonusShop webhooks

## 💡 Neste steg

Når systemet kjører:
1. Test webhook-mottakinga med curl POST
2. Legg til Gmail-integrasjon (optional)
3. Konfigurer Stripe webhook i dashboard

---

**Status**: ✅ Alt klart for innstallasjon på Mac!
