# bookstore-admin

Admin panel for the bookstore ecosystem.

## Stack

- Next.js 16 + React 19 + TypeScript
- `tharaday` design system components
- React Query for remote state
- React Hook Form + Zod for admin forms

## Scripts

- `npm run dev` - run local dev server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run build` - production build

## Environment

Copy `.env.example` and configure values as needed.

- `NEXT_PUBLIC_API_BASE_URL` - API host (defaults to `https://tharaday-vercel.vercel.app`)
- `NEXT_PUBLIC_BASE_PATH` - base path for static hosting
- `NEXT_PUBLIC_ASSET_PREFIX` - asset prefix override

## Notes

- App-level auth session is stored in browser localStorage.
- API requests include a bearer token after login.
- Routes are client-guarded: unauthenticated users are redirected to `/login`.
