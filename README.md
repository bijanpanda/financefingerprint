This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environments

This project has two environments, kept apart by which git branch you're on
— no manual switching of secrets required:

- **`main`** → Vercel **Production**. Uses the real Firebase projects
  (`financialfingerprint-in` / `-us`) and sends real emails. Only merge
  tested, working code here.
- **`test`** (and any other branch or pull request) → Vercel **Preview**.
  Uses a single separate test Firebase project, configured only in Vercel's
  dashboard under the Preview environment. Safe to experiment on — nothing
  here touches real user data.

Workflow: do your work on `test` (or a feature branch merged into `test`),
push it, and Vercel builds a Preview URL automatically. Once it looks good
there, open a pull request from `test` into `main` and merge — Vercel
redeploys Production automatically, already pointed at the production config.

See `.env.local.example` for which variables belong to which environment.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
