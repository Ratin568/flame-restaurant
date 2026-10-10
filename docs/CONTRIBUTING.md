# Contributing

1. Use the existing Next.js App Router, TypeScript, Prisma and `next-intl` patterns.
2. Keep business rules server-side and validate user input with Zod.
3. Never trust client-supplied prices, roles, payment status or authorization flags.
4. Add focused unit tests for deterministic business logic and update QA status honestly.
5. For schema changes, update `prisma/schema.prisma` and add a non-destructive migration.
6. Preserve all supported locales and run `npm run qa:i18n`.
7. Run `npm run test:unit`, `npm run typecheck`, and `npm run lint` when dependencies are available.
8. Do not commit `.env*`, generated secrets, customer data, `node_modules`, build output or ZIP artifacts.
