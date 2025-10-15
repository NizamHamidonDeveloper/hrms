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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production Deployment & Troubleshooting

### TypeScript & ESLint Fixes
- All type errors and linter issues have been resolved. If you encounter new type errors, check for missing interfaces or incorrect types in your components.
- If you see a type error about `ApprovalRequest`, ensure the interface is defined at the top of the relevant file.
- For NextAuth session types, make sure to extend the session and token objects in your custom types file.

### Building for Production
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Build the app:**
   ```bash
   npm run build
   ```
3. **Start the app with PM2:**
   ```bash
   pm2 start npm --name hrms-next -- run start
   pm2 list
   pm2 logs hrms-next
   ```

### Nginx/OpenResty Reverse Proxy Example
Make sure your Nginx config forwards requests to your Next.js app (default port 3000):

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_buffering off;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**Important:** Remove or comment out any `try_files ... /index.php` lines in your `location /` block to avoid conflicts with Next.js routing.

### Common Issues
- **404 Not Found (openresty/nginx):** Your proxy is not forwarding to the Next.js app. Check your Nginx config.
- **Next.js 404:** The route does not exist in your app, or you are being redirected to `/login` and that page is missing.
- **Login Redirect Loop:** Make sure `/login` exists and your NextAuth config is correct.

### PM2 Auto-Start on Reboot
```bash
pm2 startup
pm2 save
```

## Recent Fixes (June 2024)
- Resolved all TypeScript and ESLint errors across the codebase.
- Fixed all prop type mismatches, especially Sidebar's prop (now uses activeRole).
- Cleaned up dashboard and approvals pages to use correct role/roles logic.
- Updated API route handler signatures for Next.js App Router compatibility.
- Replaced all `any` types with proper interfaces.
- Removed unused variables and handlers.
- Replaced all `<img>` tags with Next.js `<Image />` where required.
- Added missing useEffect dependencies or silenced warnings as appropriate.
- Ensured all pages and API routes build and lint cleanly (except for one non-blocking useEffect dependency warning).

## Development Notes / What to Avoid
- **Do not use `any` types**; always use or define a proper interface or type.
- **Do not add props to components without updating their prop types** (e.g., SidebarProps).
- **Do not ignore linter/type errors**; always resolve or explicitly silence them with a comment and justification.
- **Do not fetch data in useEffect with a dependency array that causes infinite loops**; use `useMemo` for derived arrays and only add true dependencies.
- **Do not use hardcoded role strings in multiple places**; use enums or constants if possible.
- **Do not leave unused variables or functions in the codebase**.
- **Do not use `<img>` tags for local/static images**; use Next.js `<Image />` for optimization.
- **Do not bypass Next.js API route handler signatures**; always use the correct arguments for App Router.

---

For future development, always run `npm run build` and `npm run lint` before pushing to main. If you see any errors or warnings, resolve them immediately or document why they are being silenced.
