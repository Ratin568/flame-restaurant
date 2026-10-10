# Install Flame v14 hardening patch

1. Back up the project directory and PostgreSQL database. Apply the patch to a separate branch/copy first.
2. Extract `flamev14-patch.zip` into the project root, preserving folder paths and allowing changed files to be replaced. No original source files are deleted by the patch.
3. Configure `.env` before installing dependencies. At minimum, set a valid `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, and the actual restaurant `RESTAURANT_TIME_ZONE` (IANA identifier such as `Europe/Rome` or `Asia/Tehran`). Use `.env.example` as a reference; do not copy placeholder credentials verbatim.
4. Install from the existing lockfile:
   ```bash
   npm ci
   ```
5. Start the local database and Redis if you use the supplied Compose services:
   ```bash
   docker compose up -d postgres redis
   ```
6. Apply additive migrations:
   ```bash
   npx prisma migrate deploy
   ```
   The migration adds nullable contact-email fields, branch reservation capacity/duration defaults and supporting indexes. Existing rows are preserved.
7. Run local checks:
   ```bash
   npm run qa:i18n
   npm run qa:static
   npm run test:unit
   npm run test:integration
   npm run typecheck
   npm run lint
   npm run build
   npm run test:smoke
   ```
   `test:integration` requires the migrated PostgreSQL database. `test:smoke` requires a successful production build and tests the built Next server over HTTP. GitHub Actions runs both after the migration/build steps.
8. Start development with `npm run dev`; test login/2FA, checkout and mock payment (development only), reservation capacity/timezone behavior, admin status updates and email delivery in a controlled environment.

## Rollback

- Stop the app and restore the prior source files from your backup or re-extract the original `flamev14.zip` into a separate clean folder.
- The migration is additive. Usually the application can be rolled back while leaving these columns and indexes in place. Do not drop them blindly; confirm migration state and deployed code compatibility first.
- Restore the database backup only if data corruption or an incompatible migration is confirmed. A database restore overwrites data created after the backup.
