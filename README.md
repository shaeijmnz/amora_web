# Amora Florals — Admin Web + Laravel Backend

Admin dashboard (React/Vite) + Laravel API/database backup.

## Folders

| Folder | What |
|--------|------|
| `web/` | React admin dashboard (Vite) |
| `laravel/` | Laravel API + SQLite database |

## Run Laravel API

```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
# sqlite file at database/database.sqlite (or: php artisan migrate --seed)
php artisan serve --host=127.0.0.1 --port=8000
```

### Demo accounts (seeded)

- Admin: `admin@amoraflorals.com` / `password123`
- Customer: `customer@amoraflorals.com` / `customer123`

## Run Admin Web

```bash
cd web
cp .env.example .env
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open: http://127.0.0.1:5173/login

## Notes

- Do **not** commit `laravel/.env` or `web/.env` (secrets stay local).
- Customer mobile app lives in a separate repo: `amora_mobile`.
