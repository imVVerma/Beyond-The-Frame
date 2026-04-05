# Beyond The Frame: A Narrative Photography Archive

**Beyond The Frame** is a premium, production-grade digital gallery and photography portfolio. It is designed to be more than just a grid of images—it is an immersive storytelling platform that blends high-performance media delivery with artificial intelligence.

<img src="https://beyond-the-frame-sigma.vercel.app/og-image.png" alt="Archive Landing" width="800" height="400" />

## 🎨 Design Philosophy
- **Editorial Aesthetic**: A high-contrast, "Digital Journal" feel using Bodoni Moda and Manrope typography.
- **Motion First**: Staggered scroll-reveal animations and smooth state transitions powered by Framer Motion.
- **Performance Centric**: Optimized for Core Web Vitals (LCP) using Next.js Image optimization and globally adaptive CDNs.

## 🛠️ The Modern Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **Engine**: [React 19](https://react.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Database & Storage**: [Firebase](https://firebase.google.com/) (Cloud Firestore, Storage, Authentication)
- **AI Engine**: [Google Gemini Pro](https://ai.google.dev/) (Used for narrative generation and metadata extraction)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Modern Vanilla CSS
- **Performance**: [Vercel Speed Insights](https://vercel.com/speed-insights) & `next/image` (WebP/AVIF Edge conversion)

## 🚀 Key Features
- **Magic Draft**: AI-powered storytelling that turns your EXIF data and photograph context into compelling narratives.
- **Responsive Canvas**: A fully adaptive interface that transitions seamlessly from widescreen monitors to handset mobile browsers.
- **Metadata Intelligence**: Automatic extraction of technical data (ISO, Aperture, Shutter Speed) via `exifr`.
- **Dynamic SEO**: Comprehensive Open Graph and Twitter metadata for professional social sharing.

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Firebase Project**: Setup Firestore, Storage, and Google Auth.
- **Google AI Studio Key**: Required for the Gemini narrative features.

### 2. Installation
Clone the repository and enter the frontend directory:
```bash
git clone https://github.com/imVVerma/Beyond-The-Frame.git
cd Beyond-The-Frame/frontend
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the `frontend` folder with the following keys:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_id

# AI Pipeline
GEMINI_API_KEY=your_gemini_key

# Admin Access
NEXT_PUBLIC_ADMIN_EMAIL=your_email@gmail.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📦 Production Deployment
The project is optimized for deployment on the **Vercel Platform**. 
- Simply link your GitHub repository to Vercel.
- Configure the Environment Variables in the Vercel dashboard.
- The build command is `npm run build`.

---

> [!TIP]
> **Performance Verification**: Use the Vercel Speed Insights dashboard to monitor real-time LCP and CLS metrics as you upload new high-resolution content.
