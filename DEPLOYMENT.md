# Deployment Guide for pastidatang.com

This guide explains how to deploy the Pastidatang application to Vercel and connect it with your custom domain (pastidatang.com).

## Prerequisites

1. A Vercel account (create one at [vercel.com](https://vercel.com) if needed)
2. Access to the DNS settings for pastidatang.com
3. Supabase project setup with tables created
4. Telegram Bot token (created with BotFather)

## Step 1: Fork or Clone the Repository

Clone this repository to your local machine or fork it to your GitHub account.

```bash
git clone https://github.com/greenrush21/pastidatang-app.git
cd pastidatang-app
```

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

2. Update the values with your actual credentials:
   - SUPABASE_URL and SUPABASE_KEY from your Supabase project
   - TELEGRAM_BOT_TOKEN from BotFather
   - Generate a secure JWT_SECRET (you can use `openssl rand -base64 32`)

## Step 3: Deploy to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the project:

```bash
vercel
```

4. Follow the CLI prompts to link to your Vercel account and project.

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: frontend/build

6. Add the environment variables from your `.env` file
7. Deploy the project

## Step 4: Set Up Custom Domain

1. In the Vercel dashboard, go to your project settings
2. Navigate to the "Domains" tab
3. Add your domain: `pastidatang.com`
4. Follow Vercel's instructions for domain verification

### Option 1: Use Vercel as nameserver (recommended)

Update your domain registrar to use Vercel's nameservers:
- ns1.vercel-dns.com
- ns2.vercel-dns.com

### Option 2: Configure DNS Records

If you prefer to keep your current DNS provider, add the following records:
- A Record: Point `pastidatang.com` to `76.76.21.21`
- CNAME Record: Point `www.pastidatang.com` to `cname.vercel-dns.com`

## Step 5: Configure Telegram Bot Webhook

After deployment, set up the webhook for your Telegram bot to connect to your API:

```bash
curl -X POST https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://pastidatang.com/webhook
```

Replace `<TELEGRAM_BOT_TOKEN>` with your actual bot token.

## Step 6: Verify Deployment

1. Visit your domain (pastidatang.com) to verify the frontend is working
2. Test the Telegram bot to ensure it connects properly
3. Check API endpoints for proper functionality

## Troubleshooting

### Issues with API Connection

- Verify environment variables are correctly set in Vercel
- Check Vercel logs for any errors
- Ensure your Supabase project is properly configured

### Domain Connection Issues

- DNS changes can take up to 48 hours to propagate
- Verify your DNS settings match Vercel's requirements
- Use a tool like [dnschecker.org](https://dnschecker.org) to verify DNS propagation

### Telegram Bot Not Responding

- Check that the webhook is properly set
- Verify the bot token is correct
- Check server logs for any webhook processing errors

## Automatic Deployments

Once set up, any changes pushed to the main branch will automatically trigger a new deployment on Vercel.

## Need Help?

If you encounter any issues with deployment, please open an issue in the GitHub repository or contact the development team.