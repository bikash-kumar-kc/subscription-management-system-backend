# SUBSCRIPTION-MANAGEMENT-SYSTEM




### This system allows users to:

- 🔐 Authenticate securely (JWT-based auth)
- 💳 Purchase subscriptions via Stripe
- 📅 Manage recurring subscriptions
- ⏰ Schedule automated workflows (email reminders, renewals)
- ⚡ Use Redis for caching & queue management
- ☁️ Upload media using Cloudinary
- 🛡️ Apply rate limiting & protection using Arcjet


### To use/test, you need following credentials/key in .env


``` Server
PORT=
NODE_ENV=

# Database
MONGO_DB=

# JWT
JWT_SECRET_KEY=
JWT_TOKEN_EXPIRE=

# Arcjet
ARCJET_TOKEN=
ARCJECT_ENV=

# QStash (Upstash)
QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Local Server
LOCAL_SERVER_URL=

# Email
APP_PASSWORD=
AUTHOR_MAIL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUCCESS_URL=
UNSUCCESS_URL=

# Frontend
FRONTEND_URL=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

```
