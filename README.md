# tejk.chat

Minimal chatbot website backed by the OpenAI API, with a floating photo collage in the background and the chat interface in the foreground.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your env file:
   ```bash
   cp .env.example .env.local
   ```
3. Put your OpenAI key in `.env.local`:
   ```env
   OPENAI_API_KEY=...
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Add your photos

1. Drop images into `public/photos/` (jpg, png, webp, etc).
2. Add entries in `app/photoConfig.ts`.

Example entry:

```ts
{
  src: "/photos/tej-1.jpg",
  alt: "Tej on court",
  top: "12%",
  left: "8%",
  size: 220,
  delay: "0s",
  duration: "16s",
  rotate: "-4deg",
}
```

You can tune `top`, `left`, `size`, `duration`, and `rotate` per image.

## Deploy to production (Vercel + tejk.chat)

This is the fastest path to hosting online with your domain:

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In Vercel project settings, add environment variable:
   - `OPENAI_API_KEY` = your key
4. Deploy.
5. In Vercel project settings, go to **Domains** and add `tejk.chat` (and `www.tejk.chat` if you want both).
6. At your domain registrar/DNS provider, add the DNS records Vercel shows you.
7. Wait for DNS to propagate, then verify the domain in Vercel.

Once DNS is live, your chatbot will be accessible at `https://tejk.chat`.
