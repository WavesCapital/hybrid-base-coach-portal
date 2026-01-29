# Coach/Creator Marketplace - Research Document

**Created:** January 28, 2026
**Status:** Research Phase
**Purpose:** Foundation for spec development and Tuesday partnership calls

---

## Executive Summary

After Call 7 (Jan 28, 2026), Hybrid Base has pivoted from a personal training app to a **Coach/Creator Marketplace** platform. The model is simple: coaches upload programs, users buy them, platform takes a rake. Think Whop or Skool for fitness programs.

**Core Insight (Ian):** "We're making money off of people making money off of people... those businesses are freaking huge."

**Three Partners:**
- **Kyle** - Builder, backend, AI infrastructure
- **Luke Hopkins** - Athlete face, training expertise, 850K combined followers
- **Ian Fonz** - Marketing, distribution, branding, 1.35M combined followers

**Combined Audience:** 1.6M+ followers in the hybrid athlete space

---

## Table of Contents

1. [The Vision](#1-the-vision)
2. [What We Already Have](#2-what-we-already-have)
3. [What We Need to Build](#3-what-we-need-to-build)
4. [Competitive Analysis](#4-competitive-analysis)
5. [Business Model Options](#5-business-model-options)
6. [Coach Experience (Portal)](#6-coach-experience-portal)
7. [User Experience (Marketplace)](#7-user-experience-marketplace)
8. [Technical Architecture](#8-technical-architecture)
9. [Database Schema](#9-database-schema)
10. [AI Systems](#10-ai-systems)
11. [Scaling Strategy](#11-scaling-strategy)
12. [Potential Problems & Mitigations](#12-potential-problems--mitigations)
13. [Key Decisions Made](#13-key-decisions-made)
14. [Open Questions for Tuesday Calls](#14-open-questions-for-tuesday-calls)
15. [Reference Apps](#15-reference-apps)
16. [Key Quotes from Call 7](#16-key-quotes-from-call-7)

---

## 1. The Vision

### The Problem

Ian articulated it clearly:
> "My intention when I was like, oh, I wanna do an app this year, was to find a way to automate coaching... I get 100 DMs a month about 'yo, do you do coaching? Can I find your workouts?'"

Coaches with large audiences face a scaling problem:
- They can't personally coach thousands of people
- Their followers want access to their training methods
- Current solutions (PDF programs, spreadsheets) are fragmented
- There's no good platform where coaches sell programs AND users get a great training experience

### The Solution

A two-sided marketplace:

**For Coaches:**
- Upload programs once, sell unlimited times
- Get paid automatically via the platform
- Optional AI-powered updates (less work, more money)
- Analytics on what's working

**For Users:**
- Browse programs from trusted coaches
- Buy one-time or subscribe for updates
- Programs integrate directly into training calendar
- Same app experience as current Hybrid Base

**For Platform:**
- Take a rake on all transactions
- As Ian said: "We're making money off of people making money"

### What This Changes

| Before | After |
|--------|-------|
| Personal training app | Coach/creator marketplace |
| Users follow built-in programs | Users buy programs from coaches |
| Revenue from subscriptions | Revenue from rake on transactions |
| Kyle creates content | Coaches create content |
| Limited by Kyle's coaching | Unlimited - any coach can join |

---

## 2. What We Already Have

### Frontend (Expo + React Native)

The codebase audit revealed significant existing infrastructure:

| Feature | Status | Key Files | Reusable? |
|---------|--------|-----------|-----------|
| Workout Builders | Complete | `RoutineExerciseEditor.tsx`, `SegmentBuilder.tsx` | Yes - coaches can use same builders |
| Program Library | Complete | `app/programs/library.tsx` | Yes - extend for marketplace browse |
| Calendar Integration | Complete | `useCalendarStore.ts` (40KB) | Yes - purchase → calendar same flow |
| AI Coach | Complete | `app/coach/index.tsx` (43KB) | Partial - session architecture reusable |
| Program Preview | Complete | `ProgramPreviewSheet.tsx` (30KB) | Yes - show coach programs same way |
| State Management | Complete | 20 Zustand stores | Yes - add new stores for marketplace |

**Inner Flame Integration:** Luke's training programs are already in the app, showing the full flow works:
- Program config screen
- Start date picker
- Conflict resolution
- Add to calendar

This exact flow will be used for purchased coach programs.

### Backend (FastAPI + Supabase)

| Feature | Status | Details | Reusable? |
|---------|--------|---------|-----------|
| Program APIs | Complete | Import, status, generation | Yes - extend for coach programs |
| AI Coach Service | Complete | Claude Agent SDK, session persistence | Partial |
| Exercise Database | 1000+ exercises | Full metadata, variations | Yes - coaches use same database |
| Program Drafts | Complete | Async generation, polling | Yes - coach drafts same pattern |
| Auth/JWT | Complete | Supabase JWT, RLS | Yes - add coach role |
| File Uploads | Exists | Profile photos, AI backgrounds | Yes - extend for PDFs |

**Key Insight:** ~80% of the infrastructure exists. We're adding a marketplace layer on top, not rebuilding.

### Database Tables That Exist

**Can be reused/extended:**
- `coach_sessions` - AI coach conversations (can parallel for human coaches)
- `program_drafts` - Generated programs before confirm
- `training_programs` - User's active programs
- `routines` → `routine_exercises` → `routine_sets` - Full workout structure
- `exercises` - 1000+ exercise catalog
- `athlete_training_preferences` - User preferences

**Key:** The `routines` data model is exactly what we need for coach programs. A coach's program is essentially a collection of routines with scheduling.

---

## 3. What We Need to Build

### New Database Tables

| Table | Purpose |
|-------|---------|
| `coaches` | Coach profiles (name, bio, credentials, Stripe ID, verification) |
| `coach_programs` | Programs created BY coaches for sale |
| `coach_program_purchases` | Track user purchases (one-time + subscriptions) |
| `coach_reviews` | Ratings and reviews |
| `coach_payouts` | Revenue tracking and payout history |
| `coach_applications` | Pending coach applications (Phase 2+) |

### New Frontend Screens (Mobile App)

- Marketplace browse/search
- Coach profile pages
- Program detail (extended with pricing, reviews)
- Purchase flow (Stripe Checkout)
- Subscription management

### New Systems (Coach Portal - Web)

- Coach signup/onboarding
- Program builder (PDF upload + manual creation)
- Analytics dashboard
- Earnings/payout view
- Subscriber management

### Payment Infrastructure

- Stripe Connect for marketplace
- Coach onboarding (KYC)
- Subscription management
- Refund handling
- Payout scheduling

---

## 4. Competitive Analysis

### Whop (Creator Marketplace)

**Model:** Platform for creators to sell digital products, memberships, and SaaS.

**Pricing (as of Jan 2026):**
- **3% rake** on direct sales (creator-owned links)
- **0% marketplace fee** (reduced from 30% in May 2025)
- Payment processing: 2.7% + $0.30 per transaction
- Additional fees: Invoice (0.5%), tax (0.5%), fraud ($0.07), withdrawal (0.25%)

**What They Do Well:**
- Simple pricing (no monthly fees)
- Instant marketplace approval
- Creator-first tools (analytics, pages, checkout)
- Growing take rate (4% → 5.5% as they add value)

**Platform Scale:**
- $142M annualized revenue (Oct 2025)
- Processing $1B+ annually

**Takeaway:** Low rake (3-5%) works when you have volume. They make money on processing fees + add-ons.

Sources: [Whop Docs](https://docs.whop.com/fees), [Sacra Report](https://sacra.com/c/whop/)

### Skool (Community + Courses)

**Model:** All-in-one platform for communities, courses, and events.

**Pricing:**
- **Hobby Plan:** $9/mo + 10% transaction fee
- **Pro Plan:** $99/mo + 2.9% processing (standard Stripe)

**What They Do Well:**
- Gamification (leaderboard, points for engagement)
- Community feed + Classroom + Calendar in one
- The Skool Games (Alex Hormozi partnership)
- Simple, no hidden fees

**Platform Scale:**
- 174,000+ community creators
- 1M+ user base
- Top creators making $300K+ MRR

**Takeaway:** Higher monthly fee ($99) but lower transaction fee. Community features drive engagement.

Sources: [Skool Review](https://samuelearp.com/blog/skool-review/), [Thoughtlytics](https://www.thoughtlytics.com/newsletter/skool-growth-strategies)

### TrueCoach (Personal Trainer Software)

**Model:** Coach-to-client workout delivery and management.

**Pricing:**
- **Starter:** $19.99/mo for 5 clients
- **Standard:** $52.99/mo for 20 clients
- **Pro:** $106.99/mo for 50 clients
- Scales in 25-client increments up to 250

**What They Do Well:**
- Free for clients (coach pays)
- Workout builder with video
- Real-time messaging
- Progress tracking
- Stripe integration for payments

**What They Don't Do:**
- No marketplace (coach brings own clients)
- No discovery/search
- No reviews/ratings

**Takeaway:** Per-client pricing works for 1:1 coaching but doesn't scale well for program sales.

Sources: [TrueCoach Pricing](https://truecoach.co/pricing/), [PT Pioneer Review](https://www.ptpioneer.com/personal-training/tools/truecoach-review/)

### ABC Trainerize (Personal Training Software)

**Model:** Coach-to-client training delivery with white-label app.

**Pricing:**
- **Free:** 1 client
- **Grow:** 2 clients + add-ons
- **Pro:** Up to 200 clients
- **Studio:** Up to 500 members
- Add-ons: Nutrition ($5-45/mo), Video Coaching, Branding

**What They Do Well:**
- White-label mobile app
- Sell programs via Stripe
- Nutrition integration (MyFitnessPal)
- Scheduling and appointments

**What They Don't Do:**
- No marketplace
- Complex pricing tiers
- Expensive for small coaches

**Takeaway:** Feature-rich but complex. We want simplicity.

Sources: [Trainerize Pricing](https://www.trainerize.com/pricing/), [Trainerize Features](https://www.trainerize.com/features/)

### Competitive Summary

| Platform | Model | Rake/Fee | Monthly | Marketplace? | Best For |
|----------|-------|----------|---------|--------------|----------|
| Whop | Creator marketplace | 3% + processing | Free | Yes | Digital products, courses |
| Skool | Community + courses | 10% or $99/mo | $9-99 | No | Communities |
| TrueCoach | Coach software | None | $20-107 | No | 1:1 coaching |
| Trainerize | Coach software | None | $10-250 | No | Studios |
| **Us** | Coach marketplace | TBD | Free? | Yes | Fitness programs |

**Our Unique Position:**
- Only marketplace focused specifically on training programs
- Combined audience of 1.6M+ from launch
- AI-powered program updates (unique differentiator)
- Integrated training experience (not just selling, but doing)

---

## 5. Business Model Options

### Option A: Low Rake, Volume Play

**Structure:**
- 5-10% rake on transactions
- Free for coaches to join
- Minimal payment processing fees passed through

**Pros:**
- Attracts more coaches
- Competitive with Whop (3%)
- Lower barrier to entry

**Cons:**
- Need high volume to make money
- Less revenue per transaction
- May attract lower-quality coaches

**Example:** Coach sells $50 program × 1000 sales = $50,000 GMV
- At 5%: Platform earns $2,500
- At 10%: Platform earns $5,000

### Option B: Standard Marketplace Rate

**Structure:**
- 15% rake on transactions
- Free for coaches to join
- Standard processing fees

**Pros:**
- Industry standard (app stores, most marketplaces)
- Good revenue per transaction
- Sustainable from day one

**Cons:**
- Some coaches may find it high
- Whop is cheaper (3%)

**Example:** Coach sells $50 program × 1000 sales = $50,000 GMV
- At 15%: Platform earns $7,500

### Option C: Premium Platform

**Structure:**
- 20%+ rake on transactions
- Premium features for coaches
- Active promotion/featured placement

**Pros:**
- High revenue per transaction
- Can invest in marketing, features
- Signals premium/curated

**Cons:**
- May discourage coaches
- Need to justify value

### Option D: Hybrid (Rake + Subscription Tiers)

**Structure:**
- Base rake (10%) for all coaches
- Lower rake (5%) for Pro coaches ($50/mo)
- Enterprise tier for studios

**Pros:**
- Multiple revenue streams
- Rewards committed coaches
- Predictable revenue from subscriptions

**Cons:**
- More complex
- May confuse coaches

### Recommendation

**Start with Option B (15%)** for Phase 1. Reasons:
- Simple to understand
- Industry standard
- Can adjust later based on feedback
- No monthly fees reduces friction

**Research both options** and present pros/cons to Luke/Ian on Tuesday.

---

## 6. Coach Experience (Portal)

### Portal Architecture

**Decision (confirmed by Kyle):** Web app first, separate coach app later if needed.

**Stack:**
- Next.js 15 (same stack as existing Vercel apps)
- Supabase (shared database with mobile app)
- Stripe Connect (marketplace payments)

### Coach Onboarding Flow

**Phase 1 (Invite-Only):**
1. Luke/Ian invites coach via email
2. Coach receives unique signup link
3. Creates account (email/password or social auth)
4. Completes profile (name, bio, photo, social links)
5. Connects Stripe account (for payouts)
6. Uploads first program
7. Program goes live immediately (no review needed for invited coaches)

**Phase 2+ (Open Applications):**
1. Coach applies via public form
2. AI agent researches applicant (social media, credentials)
3. Confidence score generated (0-100)
4. High confidence (>80) = auto-approve
5. Medium (50-80) = manual review queue
6. Low (<50) = auto-reject with feedback
7. Approved coaches continue to onboarding

### Program Builder

**Two Creation Paths:**

**Path A: PDF Upload (Primary)**
1. Coach uploads existing PDF program
2. AI parses structure (weeks, days, exercises)
3. System matches exercises to database (1000+)
4. Coach reviews/adjusts in visual editor
5. Preview exactly how users will see it
6. Set pricing and publish

**Path B: Manual Creation**
1. Coach uses visual program builder
2. Add weeks, days, workouts
3. Search exercise database (with video previews)
4. Set sets, reps, rest, tempo
5. Preview and publish

**Program Fields:**
- Title, description
- Duration (weeks)
- Difficulty (beginner, intermediate, advanced)
- Focus (strength, endurance, hybrid, sport-specific)
- Equipment required
- Pricing (one-time or subscription)
- Preview content (what users see before buying)

### Coach Dashboard

**Metrics to Display:**
- Total revenue (all-time, this month, this week)
- Active subscribers
- Total program sales
- Conversion rate (views → purchases)
- Completion rates (users who finish program)
- Reviews and average rating

**Actions:**
- View/edit programs
- See subscriber list
- Respond to reviews
- Request payout
- View earnings history

### Subscription Program Updates

For subscription programs, coaches must provide value:

**Option A: Manual Updates**
- Coach updates program every 8 weeks
- Notification sent to subscribers
- If coach doesn't update, subscribers notified and can cancel

**Option B: AI-Powered Updates (Toggle)**
Kyle clarified: This is a **feature toggle within subscription**, not a third program type.

How it works:
1. Coach enables "AI Updates" on subscription program
2. AI learns coach's philosophy from original program
3. AI generates new weeks following coach's style
4. Coach can review/approve or let auto-publish
5. Reduces coach workload significantly

**Selling point for coaches:** "Upload once, let AI keep it fresh. Your subscribers get continuous value, you get recurring revenue with minimal work."

---

## 7. User Experience (Marketplace)

### Discovery

**Browse Options:**
- Featured coaches (hand-picked by team)
- Browse by category (strength, running, hybrid, HYROX, etc.)
- Browse by difficulty
- Browse by duration
- Search by coach name or program name

**Sort Options:**
- Popular (most purchases)
- Highest rated
- Newest
- Price (low to high, high to low)

### Coach Profile Page

**Displays:**
- Profile photo, name, bio
- Credentials/certifications
- Social links (verified follower counts)
- All programs by this coach
- Average rating and review count
- "X users training with this coach"

**Trust Signals:**
- Verified badge (credentials checked)
- "Featured Coach" badge
- Review snippets
- Social proof numbers

### Program Detail Page

**Above the Fold:**
- Hero image/video
- Title, coach name
- Price (one-time or subscription)
- Rating and review count
- "Buy Now" or "Subscribe" button

**Program Details:**
- Full description
- Duration and schedule overview
- Equipment required
- Difficulty level
- What's included (workouts, videos, etc.)
- Sample week preview (free)

**Reviews Section:**
- Average rating
- Rating breakdown (5-star, 4-star, etc.)
- Written reviews with user photos
- Helpful/unhelpful voting

### Purchase Flow

**Decision (confirmed by Kyle):** Use existing Inner Flame flow.

**Steps:**
1. User taps "Buy Now" or "Subscribe"
2. Stripe Checkout opens (in-app browser or sheet)
3. User completes payment
4. Return to app with success confirmation
5. Program config screen appears
6. User selects start date
7. Conflict resolution if needed
8. Program added to calendar
9. User starts training

**Subscription Management:**
- View active subscriptions in Settings
- Cancel anytime (access until end of billing period)
- Pause option? (TBD)
- Reactivate with one tap

---

## 8. Technical Architecture

### System Overview

```
┌─────────────────┐      ┌─────────────────┐
│  Mobile App     │      │  Coach Portal   │
│  (Expo)         │      │  (Next.js)      │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │    Supabase Auth       │
         ├────────────────────────┤
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────┐
│           Supabase Database             │
│  (PostgreSQL + RLS + Realtime)          │
└────────────────────┬────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐      ┌─────────────────┐
│  FastAPI        │      │  Stripe Connect │
│  (AI/Backend)   │      │  (Payments)     │
└─────────────────┘      └─────────────────┘
```

### Stripe Connect Setup

**Account Type:** Express (recommended for marketplaces)
- Stripe hosts onboarding UI
- Stripe handles KYC/compliance
- Platform controls payout timing
- Lower integration burden

**Charge Type:** Destination Charges
- User pays platform
- Platform takes rake
- Remaining amount sent to coach's connected account

**Flow:**
1. Coach creates Express account during onboarding
2. Platform stores `stripe_account_id` in `coaches` table
3. User purchases program via Stripe Checkout
4. Platform creates PaymentIntent with `application_fee_amount`
5. Stripe automatically splits: platform gets rake, coach gets rest
6. Payouts to coaches on schedule (weekly recommended)

**Fees:**
- Standard Stripe processing: 2.9% + $0.30
- Connect fee: 0.25% + $0.25 per payout
- Platform can absorb or pass through

### Supabase RLS Policies

**New policies needed:**

```sql
-- Coaches: own profile access
CREATE POLICY "Coaches can view/edit own profile"
ON coaches FOR ALL
USING (user_id = auth.uid());

-- Coach programs: public read, coach write
CREATE POLICY "Anyone can view active programs"
ON coach_programs FOR SELECT
USING (status = 'active');

CREATE POLICY "Coaches can manage own programs"
ON coach_programs FOR ALL
USING (coach_id IN (
  SELECT id FROM coaches WHERE user_id = auth.uid()
));

-- Purchases: user can view own purchases
CREATE POLICY "Users can view own purchases"
ON coach_program_purchases FOR SELECT
USING (user_id = auth.uid());

-- Reviews: user can manage own reviews
CREATE POLICY "Users can manage own reviews"
ON coach_reviews FOR ALL
USING (user_id = auth.uid());
```

### Edge Functions / Webhooks

**Stripe Webhooks:**
- `checkout.session.completed` → Create purchase record
- `invoice.payment_succeeded` → Extend subscription
- `invoice.payment_failed` → Mark subscription at risk
- `customer.subscription.deleted` → End subscription access
- `account.updated` → Track coach onboarding status

**Scheduled Jobs:**
- Daily: Check for subscription programs needing AI updates
- Weekly: Generate coach payout reports
- Monthly: Send coach earnings summaries

---

## 9. Database Schema

### New Tables

```sql
-- =====================
-- COACHES
-- =====================
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,

  -- Profile
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- for profile URLs
  bio TEXT,
  profile_photo_url TEXT,
  credentials JSONB DEFAULT '[]',  -- [{type, name, issuer, year}]
  social_links JSONB DEFAULT '{}', -- {instagram, tiktok, youtube, twitter}

  -- Stripe
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Status
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,

  -- Stats (denormalized for performance)
  total_programs INT DEFAULT 0,
  total_subscribers INT DEFAULT 0,
  average_rating DECIMAL(3,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- COACH PROGRAMS
-- =====================
CREATE TABLE coach_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches NOT NULL,

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,  -- for cards

  -- Content
  duration_weeks INT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  focus TEXT[],  -- ['strength', 'endurance', 'hybrid']
  equipment TEXT[],  -- ['barbell', 'dumbbells', 'pull-up bar']

  -- The actual program (same structure as existing routines)
  template_data JSONB NOT NULL,  -- weeks, days, workouts, exercises

  -- Preview (what users see before buying)
  preview_data JSONB,  -- first week or selected content
  cover_image_url TEXT,
  promo_video_url TEXT,

  -- Pricing
  pricing_type TEXT NOT NULL
    CHECK (pricing_type IN ('one_time', 'subscription')),
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',

  -- Subscription settings
  ai_updates_enabled BOOLEAN DEFAULT FALSE,
  update_frequency_weeks INT DEFAULT 8,
  last_updated_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),

  -- Stats
  total_purchases INT DEFAULT 0,
  active_subscribers INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_reviews INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  UNIQUE(coach_id, slug)
);

-- =====================
-- PURCHASES
-- =====================
CREATE TABLE coach_program_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  coach_program_id UUID REFERENCES coach_programs NOT NULL,

  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,  -- for subscriptions
  amount_paid_cents INT NOT NULL,
  platform_fee_cents INT NOT NULL,
  coach_earnings_cents INT NOT NULL,

  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'refunded', 'expired')),

  -- Subscription tracking
  subscription_status TEXT
    CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  UNIQUE(user_id, coach_program_id)
);

-- =====================
-- REVIEWS
-- =====================
CREATE TABLE coach_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  coach_program_id UUID REFERENCES coach_programs NOT NULL,
  purchase_id UUID REFERENCES coach_program_purchases NOT NULL,

  -- Review content
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,

  -- Moderation
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, coach_program_id)
);

-- =====================
-- COACH PAYOUTS
-- =====================
CREATE TABLE coach_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches NOT NULL,

  -- Amount
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',

  -- Stripe
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed')),

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- =====================
-- COACH APPLICATIONS (Phase 2+)
-- =====================
CREATE TABLE coach_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,

  -- Social proof
  social_links JSONB,
  credentials TEXT,
  sample_program_url TEXT,

  -- AI evaluation
  ai_confidence_score INT,
  ai_evaluation_notes TEXT,

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'manual_review')),
  reviewed_by UUID REFERENCES auth.users,
  review_notes TEXT,

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
```

### Indexes

```sql
-- Coach lookups
CREATE INDEX idx_coaches_user_id ON coaches(user_id);
CREATE INDEX idx_coaches_slug ON coaches(slug);
CREATE INDEX idx_coaches_verification ON coaches(verification_status);

-- Program discovery
CREATE INDEX idx_coach_programs_coach ON coach_programs(coach_id);
CREATE INDEX idx_coach_programs_status ON coach_programs(status);
CREATE INDEX idx_coach_programs_pricing ON coach_programs(pricing_type);
CREATE INDEX idx_coach_programs_focus ON coach_programs USING GIN(focus);

-- Purchase lookups
CREATE INDEX idx_purchases_user ON coach_program_purchases(user_id);
CREATE INDEX idx_purchases_program ON coach_program_purchases(coach_program_id);
CREATE INDEX idx_purchases_status ON coach_program_purchases(status);

-- Review aggregation
CREATE INDEX idx_reviews_program ON coach_reviews(coach_program_id);
CREATE INDEX idx_reviews_rating ON coach_reviews(rating);
```

---

## 10. AI Systems

### PDF Parsing

**Goal:** Coach uploads PDF → System converts to structured program.

**Approach:**
1. Extract text from PDF
2. Send to Claude with schema for expected output
3. Match exercises to database (fuzzy matching)
4. Generate `template_data` JSONB
5. Return for coach review/editing

**Challenges:**
- PDFs have wildly different formats
- Exercise names vary (bench press vs barbell bench vs flat bench)
- Sets/reps notation varies (3x10 vs 3 sets of 10 vs 10/10/10)

**Solution:** Use Claude with few-shot examples of different PDF formats. Accept 80% accuracy and let coach fix the rest.

### AI-Powered Program Updates

**Goal:** Keep subscription programs fresh without coach work.

**Approach:**
1. Analyze original program structure and philosophy
2. Generate new weeks that follow same patterns
3. Progressive overload built in
4. Maintain exercise selection preferences
5. Option for coach review before publish

**Implementation:**
- Reuse existing program generation infrastructure
- Add "style extraction" step to learn from coach's program
- Generate with explicit instructions to match style

### Coach Vetting (Phase 2+)

**Goal:** Automatically evaluate coach applications.

**Approach:**
1. Scrape social media profiles
2. Verify follower counts
3. Analyze content quality (sentiment, engagement)
4. Cross-reference claimed credentials
5. Generate confidence score

**Output:**
- Score 0-100
- Key findings (verified followers, credential issues, etc.)
- Recommendation (approve, review, reject)

---

## 11. Scaling Strategy

### Phase 1: Exclusive Launch (Months 1-6)

**Approach:** Luke and Ian personally invite coaches they know and trust.

**Target:** 10-20 coaches maximum

**Focus:**
- Quality over quantity
- Build reputation for curated content
- Work out kinks in platform
- Gather feedback from early coaches

**Vetting:** None needed - personal invites only

**Marketing:** Luke and Ian promote on their channels

### Phase 2: Moderated Open (Months 6-12)

**Approach:** Open applications with AI screening

**Criteria:**
- Minimum social following (e.g., 10K combined)
- Quality content/programs
- No red flags in background

**Process:**
1. Public application form
2. AI evaluation generates confidence score
3. High confidence (>80): auto-approve
4. Medium (50-80): manual review by team
5. Low (<50): auto-reject with feedback

**Quality Control:**
- Verified badge for approved coaches
- Community reporting system
- Regular audits of program quality
- Remove coaches who violate terms

### Phase 3: Full Open (12+ months)

**Approach:** Anyone can become a coach

**Ian's Quote:** "At the end of the day, if he's selling 50 subscriptions a month and I don't like his workouts... I don't care. I'll have his ass."

**Philosophy:** Buyer beware
- Reviews and ratings drive discovery
- Bad coaches get buried by algorithm
- Platform still moderates for violations
- Focus on user protection, not curation

---

## 12. Potential Problems & Mitigations

| Problem | Risk | Mitigation |
|---------|------|------------|
| Bad programs hurt brand | High | Strict Phase 1 vetting, review system, quality thresholds |
| Refund abuse | Medium | Ian suggested: one refund per 6 months per user |
| Coach churn | Medium | Make it easy to succeed - analytics, promotion, AI updates |
| Price race to bottom | Medium | Minimum price floors? Featured placements for quality? |
| Subscription fatigue | Medium | Auto-pause if user inactive, easy cancellation |
| Copyright issues | Low | Coach certifies they own content, DMCA process |
| Technical support burden | Medium | Self-serve help docs, coach community, FAQ |
| Payment disputes | Low | Clear refund policy, Stripe handles disputes |
| Coach doesn't update subscription | Medium | Notifications, auto-pause subscription, partial refund |
| Coaches leave for competitors | Medium | Best tools, lowest friction, community, AI updates |
| Platform exploited by spam coaches | Medium | Phase 2 vetting, community reporting, rate limits |

### Biggest Risks

1. **Quality Control at Scale** - As we open up, maintaining quality gets harder. Solution: Strong review system, algorithmic discovery favoring quality.

2. **Coach Economics** - If rake is too high or volume too low, coaches won't stay. Solution: Research rake %, invest in coach success.

3. **User Trust** - If users buy bad programs, they won't buy again. Solution: Verified badges, reviews, previews, refund policy.

---

## 13. Key Decisions Made

| Decision | Answer | Source |
|----------|--------|--------|
| Coach Portal | Web app first, separate coach app later if needed | Kyle |
| AI Continuous | Feature toggle within subscription (AI updates instead of manual), not third type | Kyle |
| Initial Roster | Luke/Ian personally invite who they want - no formal vetting for Phase 1 | Kyle |
| Purchase Flow | Use existing Inner Flame flow (config → start date → calendar) | Kyle |
| Research Format | Requirements only, no wireframes | Kyle |
| Naming | "Hybrid" is out - need new name | Call 7 |
| Simplicity | 4 tabs max, no rabbit holes, talk to users like 2-year-olds | Ian (Call 7) |
| Platform Model | Marketplace with rake (like Whop), not software subscription (like Trainerize) | Ian (Call 7) |

---

## 14. Open Questions for Tuesday Calls

### Research and Present Options

**1. Rake Percentage**
- Option A: 5-10% (volume play, compete with Whop)
- Option B: 15% (industry standard)
- Option C: 20%+ (premium platform)

Recommendation: Present pros/cons of each, get input.

**2. Free Programs**
- Option A: Allow coaches to offer free programs (lead magnets, build audience)
- Option B: Paid only (platform is premium, free content goes on social)

Recommendation: Research both, discuss tradeoffs.

### Still Need Answers

**3. Refund Policy**
- Platform-wide policy? (e.g., 7-day money back)
- Coach discretion?
- Ian's idea: one refund per 6 months per user

**4. Subscription Update Frequency**
- Every 8 weeks (suggested by Ian)?
- Coach decides?
- What happens if coach doesn't update?

**5. Naming**
- What replaces "Hybrid Base"?
- Ian wants something that doesn't box in ("like Zoom - not FaceTimey")

**6. Coach Tiers**
- Free tier for all coaches?
- Paid Pro tier with lower rake?
- Enterprise for studios?

**7. Exclusivity**
- Can coaches sell same programs elsewhere?
- Or exclusive to our platform?

**8. Launch Timeline**
- When do we want to launch Phase 1?
- How much time for polish before launch?

---

## 15. Reference Apps

### Study These

| App | What to Learn | Priority |
|-----|---------------|----------|
| **Run app** | Simplicity - 4 tabs, clean UI. Sold for $350M to Strava. | High |
| **Whop** | Marketplace model, creator tools, checkout flow, analytics | High |
| **TrueCoach** | Coach-client relationship, program delivery, messaging | Medium |
| **Trainerize** | Program builder UX, coach dashboard, client management | Medium |
| **Share Aura** | Sharing features, AI-generated images | Low |

### What NOT to Do

| App | Anti-Pattern |
|-----|--------------|
| **Endorphins** | Too busy, rabbit holes, overwhelming UI |

Ian's Quote: "Endorphins is so busy... you click one thing and you're in a rabbit hole."

### Design Principles (from Ian)

1. **Simplicity first** - "If we're for everything, we're for nothing"
2. **4 main tabs max** - Like Run app
3. **No rabbit holes** - Easy to navigate back
4. **Aesthetically pleasing** - Polish before launch
5. **Talk to users like 2-year-olds** - Not everyone knows sets/reps jargon

---

## 16. Key Quotes from Call 7

### On the Vision

**Ian:**
> "My intention when I was like, oh, I wanna do an app this year, was to find a way to automate coaching... I get 100 DMs a month about 'yo, do you do coaching? Can I find your workouts?'"

**Ian:**
> "We're making money off of people making money off of people... those businesses are freaking huge."

### On Simplicity

**Ian:**
> "The Run app - simple. Four tabs. That's it."

**Ian:**
> "Endorphins is so busy... you click one thing and you're in a rabbit hole."

**Ian:**
> "If we're for everything, we're for nothing."

### On Naming

**Ian:**
> "It's cool, but it's too predictable... like Zoom - that's a FaceTime call. It's not like 'FaceTimey.' Literally, a name that could have nothing to do with it, and then we redefine the name."

### On Scaling

**Ian:**
> "At the end of the day, if he's selling 50 subscriptions a month and I don't like his workouts... I don't care. I'll have his ass."

### On the Opportunity

**Ian:**
> "I feel like we can really do something here. The difference here is you have two creators hot in the space that can lead it from the ground up."

### On Kyle's Flexibility

**Kyle:**
> "I'm not even tied to the name or anything. I'm down to change everything."

---

## 17. Live Training Sync Feature (Kyle's Idea - Jan 29)

### The Concept

**"Train Like Your Favorite Athlete"** - A subscription feature where users automatically get their favorite coach's actual training synced to their calendar with a delay.

### How It Works

1. **Coach Enables Sync** - Coach opts into sharing their real training (not just programs they create)
2. **Everything Gets Logged** - Coach's actual workouts, runs, meals, recovery - everything they do gets captured
3. **Delayed Mirror** - User subscribes, and that training appears on their calendar a few days later
4. **Automatic Programming** - No manual work for coach or user - it just shows up

### Example Flow

```
Monday:     Coach does heavy squat session
Tuesday:    Coach does zone 2 run + mobility
Wednesday:  Coach does upper body
Thursday:   Coach does HYROX simulation

↓ 3-day delay ↓

Thursday:   User's calendar shows Coach's Monday squat session
Friday:     User's calendar shows Coach's Tuesday run + mobility
Saturday:   User's calendar shows Coach's Wednesday upper body
Sunday:     User's calendar shows Coach's Thursday HYROX sim
```

### Why This Is Powerful

**For Users:**
- "I want to look like this guy" → Now you can actually train like him
- "I want to run as fast as this guy" → See if you're putting in the same work
- No guessing - see EXACTLY what elite athletes actually do
- Accountability through comparison

**For Coaches:**
- Passive income - just train like you normally do
- Authentic content - not curated programs, real training
- Deeper connection with followers - "train with me"
- Premium pricing justified - exclusive access to their actual regimen

### Technical Requirements

**Data Capture:**
- Workouts (already built - coach uses the app to log)
- Runs/cardio (integrate with Strava/Garmin?)
- Nutrition (manual logging or integrate with MyFitnessPal?)
- Recovery/sleep (integrate with Whoop/Oura?)

**Sync System:**
- Configurable delay (coach sets: 2 days, 3 days, 1 week, etc.)
- Selective sharing (coach can exclude certain activities)
- Auto-push to subscriber calendars
- Notification: "New training from [Coach] added to your calendar"

**Subscription Model:**
- Monthly fee set by coach
- Higher tier than static programs (real-time access is premium)
- Coach gets majority of subscription revenue

### Differentiation

| Feature | Static Programs | Live Sync |
|---------|-----------------|-----------|
| Content | Pre-created, finite | Real, continuous |
| Updates | Manual (8 weeks) | Automatic (daily) |
| Authenticity | Coach's methodology | Coach's actual training |
| Effort for Coach | Create once | Just train |
| User Connection | Following a plan | Training "with" coach |
| Pricing | One-time or subscription | Premium subscription |

### Open Questions

1. **Delay Length** - What's the sweet spot? 2-3 days? 1 week?
2. **What Gets Shared** - Just workouts? Nutrition too? Recovery?
3. **Privacy Controls** - Can coach exclude certain days/activities?
4. **Data Sources** - App only? Or integrate wearables/other apps?
5. **Pricing** - How much more than static programs?
6. **Conflict Handling** - What if coach trains 6x/week but user can only do 4?

### Implementation Phases

**Phase 1:** Manual coach logging → delayed sync to subscribers
**Phase 2:** Auto-import from Strava/Garmin/etc.
**Phase 3:** AI-powered adaptation (scale coach's training to user's level)

---

## 18. Tech Stack Decision: Expo Universal vs Next.js

### The Question (Applied to Hybrid Base)

For the coach portal, should we:
- **Option A:** Add coach portal screens to the existing Hybrid Base Expo app (works on web)
- **Option B:** Build a separate Next.js web app that shares the same Supabase database
- **Option C:** Start with Expo, pivot to Next.js if it doesn't work well

### Your Current Situation

**What you have:**
- Hybrid Base mobile app: Expo SDK 54 + React Native
- 100+ screens already built
- 20 Zustand stores
- Components: `ProgramPreviewSheet.tsx` (30KB), `useCalendarStore.ts` (40KB), etc.
- FastAPI backend + Supabase database
- Exercise database with 1000+ exercises

**What you need:**
- Coach portal for uploading/managing programs
- Program preview that looks IDENTICAL to mobile app
- PDF parsing + review UI
- Dashboard for coaches

### Option A: Add to Existing Expo App

**How It Works:**
Add new routes in your existing app like `/coach/dashboard`, `/coach/programs`, `/coach/upload`. Use `expo-router` web support. Deploy to web via Vercel or EAS.

**What You'd Reuse:**
```
components/coach/ProgramPreviewSheet.tsx  → Preview (already exists!)
components/coach/WorkoutDetailDrawer.tsx  → Workout display
lib/coachTypes.ts                         → Type definitions
state/useCalendarStore.ts                 → Calendar logic
state/useProgramStore.ts                  → Program state
```

**Pros for YOUR situation:**
| Benefit | Specific to Hybrid Base |
|---------|-------------------------|
| **Preview is already built** | `ProgramPreviewSheet.tsx` shows programs exactly how users see them. Just render it. |
| **Exercise database integration** | Same exercise picker, same matching logic, no duplication |
| **Calendar logic reuse** | When testing "add to calendar", it's the same code path |
| **Zustand stores work** | All 20 stores available - no state management rewrite |
| **Types shared** | `coachTypes.ts`, `trainingProgramsAPI.ts` - all work |

**Cons for YOUR situation:**
| Drawback | Specific to Hybrid Base |
|----------|-------------------------|
| **Desktop UX unfamiliar** | You've built mobile UX. Desktop patterns (sidebar, hover) are new. |
| **Bundle includes mobile code** | Web bundle will include mobile-only code unless you tree-shake |
| **PDF upload on web** | Need to test file handling works well in Expo web |
| **Complex forms** | Coach profile form, program editor - web forms can be tricky in RN |

**Effort estimate:** 2-3 weeks for MVP (lots of reuse)

Sources: [Expo Router Docs](https://docs.expo.dev/router/introduction/), [Expo Web Guide](https://docs.expo.dev/guides/using-nextjs/)

### Option B: Separate Next.js Web App

**How It Works:**
Build a new Next.js app at `/coach-portal/` or a subdomain. Connects to same Supabase database. Completely separate frontend from mobile app.

**What You'd Need to Rebuild:**
```
// These exist in Expo, would need Next.js versions:
ProgramPreviewSheet   → New React component
WorkoutDetailDrawer   → New React component
Exercise picker       → New React component
Calendar preview      → New React component
All styling           → Tailwind/CSS instead of StyleSheet

// These could be shared (with some work):
TypeScript types      → Copy or npm package
API functions         → Copy or npm package
Supabase client       → New instance, same DB
```

**Pros for YOUR situation:**
| Benefit | Specific to Hybrid Base |
|---------|-------------------------|
| **You know Next.js** | You've built CGP Operations, SkyKnows, etc. in Next.js |
| **Desktop-native UX** | File uploads, drag-and-drop, sidebars - all easier |
| **shadcn/ui available** | Beautiful pre-built components for dashboards |
| **Clean separation** | Coach portal doesn't touch mobile codebase |
| **Faster web performance** | No React Native web overhead |

**Cons for YOUR situation:**
| Drawback | Specific to Hybrid Base |
|----------|-------------------------|
| **Preview problem** | Can't reuse `ProgramPreviewSheet`. Have to rebuild how programs look. |
| **Duplicate code** | Exercise picker, program display - all rebuilt |
| **Drift risk** | Mobile and web could show programs differently |
| **More total work** | Even if individual pieces are easier, more pieces to build |

**The Preview Problem (Detailed):**
To show coaches how their program looks in the app, you'd need to either:
1. **Rebuild views** - Create Next.js versions of all program/workout/calendar views. Lots of work, won't be identical.
2. **Iframe embed** - Embed the Expo web app in an iframe. Janky, but works.
3. **Screenshot service** - Generate screenshots from mobile app. Complex.

**Effort estimate:** 4-6 weeks for MVP (more building from scratch)

Source: [Next.js Pros/Cons](https://pagepro.co/blog/pros-and-cons-of-nextjs/)

### Option C: Start Expo, Evaluate Later

**How It Works:**
Build MVP with Expo Router for web. If it feels clunky or limiting, migrate to Next.js.

**Pros:**
- Fastest to MVP (reuse existing components)
- Test real user feedback before committing
- Preview is automatically accurate

**Cons:**
- Potential throwaway work if we pivot
- May invest in wrong direction

### The Preview Problem

Kyle mentioned: "The view should be pretty much identical to the way it looks in the mobile app."

This is the KEY consideration:

| Approach | Preview Accuracy | Effort |
|----------|------------------|--------|
| **Expo Universal** | Perfect - same components render | Low - it just works |
| **Next.js** | Approximate - rebuild views | High - recreate everything |
| **Next.js + Expo embed** | Good - use iframes/webviews | Medium - complex setup |

If pixel-perfect preview is a requirement, Expo has a significant advantage.

### Code Reuse Reality

With Expo Universal:
```tsx
// This component works on iOS, Android, AND web
export function ProgramCard({ program }) {
  return (
    <View style={styles.card}>
      <Text>{program.title}</Text>
      <Text>{program.duration} weeks</Text>
    </View>
  );
}
```

With Next.js:
```tsx
// Need to rebuild for web
export function ProgramCard({ program }) {
  return (
    <div className="card">
      <h3>{program.title}</h3>
      <p>{program.duration} weeks</p>
    </div>
  );
}
```

For the preview feature specifically, you'd need to either:
1. Embed the Expo app in an iframe
2. Rebuild all the mobile views in Next.js
3. Use a screenshot/render service

### My Recommendation for Hybrid Base

**Go with Expo Universal (Option A)** for these specific reasons:

| Factor | Why Expo Wins |
|--------|---------------|
| **Preview requirement** | You said "identical to mobile app." With Expo, it IS the same code. With Next.js, you'd rebuild everything. |
| **ProgramPreviewSheet exists** | 30KB of preview logic already works. Why rebuild? |
| **Exercise database** | Same picker, same matching, same 1000+ exercises. No duplication. |
| **Time to MVP** | 2-3 weeks vs 4-6 weeks. You want to show Luke/Ian something fast. |
| **Future proof** | If coaches want mobile portal later, it's already there. |

**Specific Things to Reuse:**
```
✅ ProgramPreviewSheet.tsx (30KB) - Show how program looks
✅ WorkoutDetailDrawer.tsx (32KB) - Show workout details
✅ useCalendarStore.ts (40KB) - Calendar logic for preview
✅ useProgramStore.ts - Program state management
✅ coachTypes.ts - All type definitions
✅ Exercise database + picker components
✅ Styling patterns (glass morphism, animations)
```

**What You'll Build New:**
```
📝 Coach dashboard (new screen)
📝 Profile editor (new screen)
📝 PDF upload flow (new screen)
📝 AI parsing review UI (new screen)
📝 Program editor (new screen, but uses existing components)
📝 Desktop navigation (sidebar for web, tabs for mobile)
```

**Mitigations for Expo Web:**
- Use `Platform.OS === 'web'` for web-specific layouts
- Add responsive breakpoints (mobile view vs desktop view)
- Test PDF upload early - make sure it works on web
- Use `@expo/html-elements` for semantic HTML on web

**When to reconsider Next.js:**
- If Expo web feels too slow after building (unlikely)
- If you need SSR for public coach profile pages (can always add later)
- If the file upload experience is bad (test early)

### Decision Framework

| If This Is True... | Then Choose... |
|--------------------|----------------|
| Preview accuracy is #1 priority | Expo |
| You want fastest MVP | Expo |
| Desktop UX is #1 priority | Next.js |
| You want clean separation of concerns | Next.js |
| You might want coach mobile app later | Expo |
| You want to use shadcn/ui | Next.js |

**For Hybrid Base specifically:** Preview accuracy + fastest MVP + code reuse all point to Expo.

### Separate Repo Architecture (Decision Made ✅)

**Kyle's Decision:** Two completely separate repos. No monorepo. No shared packages.

**Reasoning:** "If I change something the way it looks on desktop, it will change the way it is on mobile, and I don't really want that."

### The Approach: Complete Separation

```
Repo 1: hybrid-base (existing mobile app - untouched)
Repo 2: hybrid-base-coach-portal (new, fresh repo)
```

**How It Works:**
1. Mobile app stays exactly where it is - no changes to existing repo
2. Create a brand new repo for the coach portal
3. Copy components you need from mobile as a starting point
4. Each app evolves independently from there
5. Both hit the same Supabase database (shared backend)

### What Gets Copied (One-Time)

When setting up the coach portal, copy these as starting points:

```
From hybrid-base:                    To coach-portal:
├── components/coach/                ├── components/
│   ├── ProgramPreviewSheet.tsx      │   ├── ProgramPreviewSheet.tsx
│   ├── WorkoutDetailDrawer.tsx      │   ├── WorkoutDetailDrawer.tsx
│   └── ExercisePicker.tsx           │   └── ExercisePicker.tsx
├── lib/coachTypes.ts                ├── lib/coachTypes.ts
└── lib/exerciseMatching.ts          └── lib/exerciseMatching.ts
```

**After copying:** Each version lives its own life. Desktop changes don't affect mobile.

### Benefits of This Approach

| Benefit | Why It Matters |
|---------|---------------|
| **Zero risk to mobile** | Can't accidentally break the app |
| **Independent evolution** | Desktop UX can diverge freely |
| **Clean mental model** | "This repo = coach portal. That repo = mobile app." |
| **No monorepo complexity** | No Turborepo config, no workspaces |
| **Faster to start** | Just `create-expo-app` and go |

### Trade-offs (Accepted)

| Trade-off | Impact | Mitigation |
|-----------|--------|------------|
| **Code duplication** | Same component exists in 2 places | Accepted - they'll diverge anyway |
| **Type drift** | Types could get out of sync | Supabase is source of truth |
| **Bug fix in both** | Fix in one, remember to fix in other | Only matters for shared logic, not UI |
| **Two dependency trees** | Update packages in both repos | Minor annoyance |

### Database: Shared Supabase

Both repos connect to the **same Supabase project**. This is intentional:

```
┌──────────────────┐     ┌──────────────────┐
│  Mobile App      │     │  Coach Portal    │
│  (hybrid-base)   │     │  (new repo)      │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └──────────┬─────────────┘
                    │
         ┌──────────▼─────────┐
         │     Supabase       │
         │  (single source)   │
         └────────────────────┘
```

**Important:** Be careful with migrations. Changes to the database schema affect both apps.

### Setup Plan

1. **Create new repo:** `hybrid-base-coach-portal`
2. **Initialize Expo app:** `npx create-expo-app@latest`
3. **Copy components:** ProgramPreviewSheet, WorkoutDetailDrawer, types
4. **Configure Supabase:** Same project URL and anon key
5. **Adapt for desktop:** Wider layouts, hover states, sidebar nav
6. **Build new screens:** Dashboard, profile, PDF upload
7. **Deploy to Vercel:** Expo web output

### Tech Stack for Coach Portal

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Expo (web) | Reuse copied components, same patterns |
| Routing | Expo Router | Familiar, works on web |
| State | Zustand | Same as mobile, easy to copy stores |
| Styling | StyleSheet + web media queries | Start with mobile code, adapt |
| Database | Supabase (shared) | Single source of truth |
| Deploy | Vercel | Fast, free tier, easy |

### Future: Coach Analytics & User Data Dashboards

Kyle asked: "In the future, I want to add features where the coach can see all the data from the users. Is Expo fully capable of that and making it beautiful?"

**Answer: Yes.** Here's why:

**Expo Web Compiles to React:**
Under the hood, Expo web outputs standard React. This means you have access to the web ecosystem for data visualization.

**Data Visualization Libraries That Work:**

| Library | Type | Works on Expo Web? |
|---------|------|-------------------|
| `victory-native` | Charts | ✅ Yes (cross-platform) |
| `react-native-chart-kit` | Charts | ✅ Yes (cross-platform) |
| `recharts` | Charts (web-only) | ✅ Yes (conditional import) |
| `nivo` | Charts (web-only) | ✅ Yes (conditional import) |
| `chart.js` | Charts (web-only) | ✅ Yes (conditional import) |
| `@tanstack/react-table` | Data tables | ✅ Yes |

**How to Use Web-Only Libraries:**
```tsx
import { Platform } from 'react-native';

// Conditional import for web-only libraries
const Recharts = Platform.OS === 'web'
  ? require('recharts')
  : null;

function CoachDashboard() {
  if (Platform.OS === 'web' && Recharts) {
    return (
      <Recharts.LineChart data={userData}>
        <Recharts.Line dataKey="workoutsCompleted" />
      </Recharts.LineChart>
    );
  }
  // Fallback for native (if ever needed)
  return <VictoryChart>...</VictoryChart>;
}
```

**What Coaches Will See (Future Features):**
- User completion rates (how many finish programs)
- Average workout duration
- Most/least popular exercises
- User retention over time
- Revenue per program
- Subscriber growth charts
- User feedback and reviews

**Styling for Beautiful Dashboards:**
- Use `Platform.select()` for web-specific styles
- CSS Grid layouts work on web
- Can use NativeWind (Tailwind) for utility classes
- Animations with `react-native-reanimated` work on web

**When to Consider Next.js Instead:**

| Scenario | Recommendation |
|----------|----------------|
| MVP dashboard (basic stats) | Expo is fine |
| Complex real-time analytics | Expo still works |
| Heavy SEO needs for public pages | Consider Next.js |
| Want shadcn/ui components | Consider Next.js |
| Team prefers traditional React | Consider Next.js |

**Bottom Line:** Start with Expo. It handles dashboards well. If you ever hit a wall with complex analytics (unlikely), you can add specific Next.js pages later without rewriting everything.

### When Components Diverge (Expected)

Over time, the copied components WILL diverge. This is fine and expected:

**Mobile ProgramPreviewSheet:**
- Touch gestures, swipe to dismiss
- Compact layout for phone screens
- Bottom sheet presentation

**Desktop ProgramPreviewSheet:**
- Hover states, keyboard navigation
- Wider layout with sidebar
- Modal or inline presentation

**This is the point.** You want them to evolve for their platforms.

---

## 19. AI PDF Parsing Deep Dive

### The Challenge

Coaches have PDFs in wildly different formats:
- Some are beautifully designed with graphics
- Some are spreadsheet exports
- Some are handwritten and scanned
- Exercise names vary (bench press vs barbell bench vs flat bench)
- Sets/reps notation varies (3x10 vs 3 sets of 10 vs 10/10/10)

**Target:** 90%+ accuracy in converting any PDF to our program format.

### Architecture Decision: OpenRouter for Model Flexibility ✅

**Kyle's requirement:** "If we can use OpenRouter with structured outputs, that's probably best so that way we can change the model at any time."

**Good news: OpenRouter fully supports structured outputs.**

Source: [OpenRouter Structured Outputs Documentation](https://openrouter.ai/docs/guides/features/structured-outputs)

**How It Works:**

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-sonnet-4',  // Can swap to any model
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: pdfContent }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'training_program',
        strict: true,
        schema: PROGRAM_SCHEMA  // Defined below
      }
    }
  })
});
```

**Models That Support Structured Outputs via OpenRouter:**
| Model | Provider | Speed | Cost | Notes |
|-------|----------|-------|------|-------|
| `anthropic/claude-sonnet-4` | Anthropic | Fast | ~$3/M tokens | Best balance |
| `anthropic/claude-opus-4.5` | Anthropic | Slower | ~$15/M tokens | Most accurate |
| `openai/gpt-4o` | OpenAI | Fast | ~$5/M tokens | Good alternative |
| `google/gemini-2.0-flash` | Google | Fastest | ~$0.10/M tokens | Cheapest, good for bulk |
| `meta-llama/llama-3.3-70b` | Various | Medium | ~$0.50/M tokens | Open source option |

**Why OpenRouter:**
1. **Swap models without code changes** - Just change the `model` parameter
2. **Unified API** - Same schema works across all providers
3. **Fallback support** - Can auto-fallback to another model if one fails
4. **Cost optimization** - Use cheap models for simple PDFs, expensive for complex
5. **Response Healing** - Auto-fixes malformed JSON (reduces defects by 80%)

### Three-Stage Pipeline (Final Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAGE 1: PDF EXTRACTION                      │
│                         (MinerU)                                │
├─────────────────────────────────────────────────────────────────┤
│  Input: Raw PDF file                                            │
│  Process: Layout detection, table parsing, OCR if needed        │
│  Output: Clean Markdown with tables preserved                   │
│  Tool: MinerU (best accuracy) or Marker (fastest)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STAGE 2: STRUCTURED EXTRACTION                  │
│                    (OpenRouter + LLM)                           │
├─────────────────────────────────────────────────────────────────┤
│  Input: Markdown from Stage 1                                   │
│  Process: LLM extracts program structure with JSON Schema       │
│  Output: Structured JSON matching our schema                    │
│  Tool: OpenRouter → Claude Sonnet (default)                     │
│  Key: Uses structured outputs for guaranteed valid JSON         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STAGE 3: EXERCISE MATCHING                     │
│              (Existing Hybrid Base System)                      │
├─────────────────────────────────────────────────────────────────┤
│  Input: Structured JSON with raw exercise names                 │
│  Process: Match to our 1000+ exercise database                  │
│  Output: Final program with exercise IDs + confidence scores    │
│  Tool: Existing fuzzy_search_exercises RPC + exercise_mapper    │
└─────────────────────────────────────────────────────────────────┘
```

### Existing Exercise Matching System (Already Built!)

You already have a sophisticated matching system. Here's what we'll leverage:

**Database Schema (`exercises` table):**
```sql
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_normalized TEXT,           -- Auto-generated for matching
    equipments TEXT[],
    body_parts TEXT[],
    target_muscles TEXT[],
    -- ... 1000+ exercises
);
```

**Fuzzy Search RPC (already exists):**
```sql
CREATE OR REPLACE FUNCTION public.fuzzy_search_exercises(
    search_query text,
    similarity_threshold real DEFAULT 0.55,
    result_limit int DEFAULT 5
)
RETURNS TABLE (id uuid, similarity real)
```

**Exercise Mapper (Python - already exists):**
```python
# /backend/lib/exercise_mapper.py
def map_exercise(source, source_id, title) -> str:
    # 1. Check alias cache (fastest)
    # 2. Exact match on normalized name
    # 3. Fuzzy match with trigram similarity
    # 4. Create fallback exercise if no match
    # 5. Cache the mapping
```

**Name Normalization (already exists):**
```python
def normalize_name(name: str) -> str:
    # 1. Lowercase
    # 2. Remove accents (é → e)
    # 3. Remove emojis/unicode
    # 4. Remove parentheticals but keep content
    # 5. Keep only alphanumeric + spaces
    # 6. Normalize whitespace
```

**Example normalizations:**
- "Bench Press (barbell)" → "bench press barbell"
- "Dumbbell Curl™" → "dumbbell curl"
- "Lat Pulldown - V Grip" → "lat pulldown v grip"

### JSON Schema for Structured Output

This is the schema we'll enforce via OpenRouter:

```typescript
const PROGRAM_SCHEMA = {
  type: 'object',
  required: ['title', 'duration_weeks', 'weeks'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      description: 'Program name extracted from PDF'
    },
    description: {
      type: 'string',
      description: 'Program description or overview if present'
    },
    duration_weeks: {
      type: 'integer',
      description: 'Total number of weeks in the program'
    },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced'],
      description: 'Inferred difficulty level'
    },
    focus: {
      type: 'array',
      items: { type: 'string' },
      description: 'Training focus areas (e.g., strength, endurance, hybrid)'
    },
    equipment: {
      type: 'array',
      items: { type: 'string' },
      description: 'Equipment required for this program'
    },
    weeks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['week_number', 'days'],
        additionalProperties: false,
        properties: {
          week_number: { type: 'integer' },
          name: { type: 'string', description: 'Week name if provided (e.g., "Deload Week")' },
          days: {
            type: 'array',
            items: {
              type: 'object',
              required: ['day_number', 'exercises'],
              additionalProperties: false,
              properties: {
                day_number: { type: 'integer' },
                name: { type: 'string', description: 'Day name (e.g., "Push Day", "Upper Body")' },
                workout_type: {
                  type: 'string',
                  enum: ['strength', 'cardio', 'hybrid', 'rest', 'active_recovery'],
                  description: 'Type of workout for this day'
                },
                notes: { type: 'string', description: 'Any day-level notes from PDF' },
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['raw_name'],
                    additionalProperties: false,
                    properties: {
                      raw_name: {
                        type: 'string',
                        description: 'Exercise name EXACTLY as written in PDF'
                      },
                      normalized_name: {
                        type: 'string',
                        description: 'Your best guess at standardized exercise name'
                      },
                      sets: {
                        type: 'integer',
                        description: 'Number of sets (null if not specified)'
                      },
                      reps: {
                        type: 'string',
                        description: 'Rep scheme as string (e.g., "8-10", "12", "AMRAP")'
                      },
                      rest_seconds: {
                        type: 'integer',
                        description: 'Rest period in seconds (null if not specified)'
                      },
                      tempo: {
                        type: 'string',
                        description: 'Tempo notation if present (e.g., "3-1-2-0")'
                      },
                      rpe: {
                        type: 'number',
                        description: 'RPE if specified (1-10 scale)'
                      },
                      percentage: {
                        type: 'number',
                        description: 'Percentage of 1RM if specified'
                      },
                      notes: {
                        type: 'string',
                        description: 'Any exercise-specific notes'
                      },
                      superset_group: {
                        type: 'string',
                        description: 'Superset identifier if exercises are grouped (e.g., "A", "B")'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    parsing_notes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Any uncertainties or assumptions made during parsing'
    }
  }
};
```

### System Prompt for LLM

```markdown
You are an expert fitness program parser. Your job is to extract training programs from PDF content and convert them into a structured JSON format.

## Instructions

1. **Extract ALL exercises** - Include warmups, cooldowns, cardio, stretching, everything.

2. **Preserve raw names** - In `raw_name`, include the exercise name EXACTLY as written in the PDF, including typos, abbreviations, or unusual formatting.

3. **Normalize names** - In `normalized_name`, provide your best guess at the standard exercise name:
   - "DB Bench" → "Dumbbell Bench Press"
   - "BB Squat" → "Barbell Back Squat"
   - "Lat PD" → "Lat Pulldown"

4. **Parse sets/reps carefully** - Common formats:
   - "3x10" → sets: 3, reps: "10"
   - "3 sets of 8-10" → sets: 3, reps: "8-10"
   - "10/10/10" → sets: 3, reps: "10"
   - "AMRAP" → sets: 1, reps: "AMRAP"
   - "5x5 @ 70%" → sets: 5, reps: "5", percentage: 70

5. **Handle rest periods** - Convert to seconds:
   - "90s rest" → rest_seconds: 90
   - "2 min rest" → rest_seconds: 120
   - "Rest as needed" → rest_seconds: null

6. **Detect supersets** - If exercises are grouped with letters (A1/A2, B1/B2) or explicitly marked as supersets, use `superset_group`.

7. **Infer workout type:**
   - Heavy compounds, low reps → "strength"
   - Running, cycling, rowing → "cardio"
   - Mix of both → "hybrid"
   - No exercises, mentions recovery → "rest" or "active_recovery"

8. **Add parsing notes** - If something is unclear or you made an assumption, add it to `parsing_notes`.

## Common Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| BB | Barbell |
| DB | Dumbbell |
| KB | Kettlebell |
| BW | Bodyweight |
| RDL | Romanian Deadlift |
| OHP | Overhead Press |
| AMRAP | As Many Reps As Possible |
| EMOM | Every Minute On the Minute |
| RPE | Rate of Perceived Exertion |

## Output

Return ONLY valid JSON matching the schema. No explanations, no markdown code blocks, just the JSON object.
```

### Exercise Matching Pipeline (Stage 3)

After LLM extraction, we match exercises to our database:

```typescript
interface MatchedExercise {
  raw_name: string;           // From PDF
  normalized_name: string;    // LLM's guess
  matched_exercise_id: string | null;  // Our DB exercise ID
  matched_exercise_name: string | null; // Our DB exercise name
  confidence: number;         // 0.0 - 1.0
  match_type: 'exact' | 'fuzzy' | 'fallback' | 'unmatched';
}

async function matchExercises(parsedProgram: ParsedProgram): Promise<MatchedProgram> {
  for (const week of parsedProgram.weeks) {
    for (const day of week.days) {
      for (const exercise of day.exercises) {
        // Step 1: Normalize the name
        const normalized = normalizeExerciseName(exercise.normalized_name);

        // Step 2: Try exact match
        const exactMatch = await supabase
          .from('exercises')
          .select('id, name')
          .eq('name_normalized', normalized)
          .single();

        if (exactMatch.data) {
          exercise.matched_exercise_id = exactMatch.data.id;
          exercise.matched_exercise_name = exactMatch.data.name;
          exercise.confidence = 1.0;
          exercise.match_type = 'exact';
          continue;
        }

        // Step 3: Try fuzzy match via RPC
        const fuzzyMatch = await supabase
          .rpc('fuzzy_search_exercises', {
            search_query: normalized,
            similarity_threshold: 0.55,
            result_limit: 1
          });

        if (fuzzyMatch.data?.[0]) {
          const { id, similarity } = fuzzyMatch.data[0];
          const exerciseData = await supabase
            .from('exercises')
            .select('name')
            .eq('id', id)
            .single();

          exercise.matched_exercise_id = id;
          exercise.matched_exercise_name = exerciseData.data?.name;
          exercise.confidence = similarity;
          exercise.match_type = 'fuzzy';
          continue;
        }

        // Step 4: No match found
        exercise.matched_exercise_id = null;
        exercise.matched_exercise_name = null;
        exercise.confidence = 0;
        exercise.match_type = 'unmatched';
      }
    }
  }

  return parsedProgram;
}
```

### Confidence Thresholds for UI

| Confidence | UI Indicator | Action Required |
|------------|--------------|-----------------|
| 1.0 (exact) | ✅ Green | None - auto-accepted |
| 0.80 - 0.99 | ✅ Green | None - high confidence fuzzy |
| 0.65 - 0.79 | ⚠️ Yellow | Coach should verify |
| 0.55 - 0.64 | ⚠️ Yellow | Coach should verify |
| < 0.55 | ❌ Red | Coach must select manually |
| 0 (unmatched) | ❌ Red | Coach must select manually |

### Handling Edge Cases

**1. Cardio Activities**
```json
{
  "raw_name": "30 min Zone 2 Run",
  "normalized_name": "Running",
  "workout_type": "cardio",
  "duration_minutes": 30,
  "notes": "Zone 2 heart rate"
}
```

**2. Supersets**
```json
{
  "exercises": [
    { "raw_name": "A1: Bench Press", "superset_group": "A", ... },
    { "raw_name": "A2: Bent Over Row", "superset_group": "A", ... },
    { "raw_name": "B1: Shoulder Press", "superset_group": "B", ... },
    { "raw_name": "B2: Lat Pulldown", "superset_group": "B", ... }
  ]
}
```

**3. Progressive Overload Notation**
```json
{
  "raw_name": "Squat",
  "sets": 5,
  "reps": "5",
  "percentage": 75,
  "notes": "Add 5lb from last week"
}
```

**4. EMOM/AMRAP Workouts**
```json
{
  "raw_name": "10 min EMOM",
  "workout_type": "hybrid",
  "notes": "Odd minutes: 10 Burpees, Even minutes: 15 KB Swings",
  "duration_minutes": 10
}
```

### Cost Estimation (Updated)

| Stage | Tool | Cost per Program |
|-------|------|------------------|
| Stage 1: Extraction | MinerU (self-hosted) | Free |
| Stage 2: LLM | OpenRouter → Claude Sonnet | ~$0.30-0.50 |
| Stage 3: Matching | Supabase RPC | ~$0.01 |
| **Total** | | **~$0.30-0.50** |

**At scale (1000 programs/month):** ~$300-500/month

**Model switching for cost optimization:**
- Simple PDFs (tables, clear structure) → Gemini Flash (~$0.05)
- Complex PDFs (graphics, mixed layouts) → Claude Sonnet (~$0.50)
- Failed parses → Retry with Claude Opus (~$1.50)

### PDF Extraction Tools Summary

| Tool | GitHub Stars | Best For | Speed | Precision |
|------|-------------|----------|-------|-----------|
| **MinerU** | 30K+ | Complex docs, tables, formulas | Slower | Highest |
| **Marker** | 29K+ | Fast conversions, research papers | Fastest (4x others) | Good |
| **Docling** (IBM) | 20K+ | Enterprise, RAG pipelines | Medium | High |

**Recommended for Hybrid Base:** MinerU (best table/structure accuracy for training programs)

**Installation:**
```bash
pip install uv
uv pip install -U "mineru[all]"
magic-pdf -p input.pdf -o output/ -m auto
```

Sources: [MinerU GitHub](https://github.com/opendatalab/MinerU), [Marker PyPI](https://pypi.org/project/marker-pdf/), [Docling GitHub](https://github.com/docling-project/docling)

### Complete Implementation Code

Here's how the full PDF parsing pipeline will work in the coach portal:

**File: `lib/pdfParsing.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// OpenRouter client with model flexibility
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

interface ParsedProgram {
  title: string;
  duration_weeks: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  focus?: string[];
  equipment?: string[];
  weeks: ParsedWeek[];
  parsing_notes?: string[];
}

interface ParsedExercise {
  raw_name: string;
  normalized_name: string;
  sets?: number;
  reps?: string;
  rest_seconds?: number;
  tempo?: string;
  rpe?: number;
  percentage?: number;
  notes?: string;
  superset_group?: string;
  // Added after matching
  matched_exercise_id?: string;
  matched_exercise_name?: string;
  confidence?: number;
  match_type?: 'exact' | 'fuzzy' | 'unmatched';
}

// ============================================
// STAGE 1: PDF Upload & Extraction (MinerU)
// ============================================

export async function extractPdfContent(pdfUrl: string): Promise<string> {
  // Option A: Self-hosted MinerU (recommended for control)
  // Option B: Use a PDF extraction API service

  // For MVP, we'll use a simple approach:
  // Send PDF to a FastAPI endpoint that runs MinerU
  const response = await fetch(`${API_BASE_URL}/pdf/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdf_url: pdfUrl })
  });

  const { markdown } = await response.json();
  return markdown;
}

// ============================================
// STAGE 2: LLM Processing (OpenRouter)
// ============================================

export async function parseWithLLM(
  markdownContent: string,
  model: string = DEFAULT_MODEL
): Promise<ParsedProgram> {

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hybridbase.app',  // Required by OpenRouter
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Parse this training program:\n\n${markdownContent}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'training_program',
          strict: true,
          schema: PROGRAM_SCHEMA
        }
      },
      // OpenRouter-specific: fallback to other models if primary fails
      route: 'fallback',
      provider: {
        order: ['Anthropic', 'OpenAI', 'Google'],
        allow_fallbacks: true
      }
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// ============================================
// STAGE 3: Exercise Matching
// ============================================

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .replace(/[^\x00-\x7F]+/g, ' ')   // Remove non-ASCII
    .replace(/[\(\[\{]([^\)\]\}]+)[\)\]\}]/g, '$1')  // Remove brackets, keep content
    .replace(/[^a-z0-9\s]/g, ' ')     // Keep only alphanumeric
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim();
}

export async function matchExercises(
  program: ParsedProgram
): Promise<ParsedProgram> {

  for (const week of program.weeks) {
    for (const day of week.days) {
      for (const exercise of day.exercises) {
        const normalized = normalizeExerciseName(exercise.normalized_name);

        // Step 1: Try exact match
        const { data: exactMatch } = await supabase
          .from('exercises')
          .select('id, name')
          .eq('name_normalized', normalized)
          .single();

        if (exactMatch) {
          exercise.matched_exercise_id = exactMatch.id;
          exercise.matched_exercise_name = exactMatch.name;
          exercise.confidence = 1.0;
          exercise.match_type = 'exact';
          continue;
        }

        // Step 2: Try fuzzy match via existing RPC
        const { data: fuzzyMatches } = await supabase
          .rpc('fuzzy_search_exercises', {
            search_query: normalized,
            similarity_threshold: 0.55,
            result_limit: 1
          });

        if (fuzzyMatches?.[0]) {
          const { id, similarity } = fuzzyMatches[0];

          // Get the exercise name
          const { data: exerciseData } = await supabase
            .from('exercises')
            .select('name')
            .eq('id', id)
            .single();

          exercise.matched_exercise_id = id;
          exercise.matched_exercise_name = exerciseData?.name || null;
          exercise.confidence = similarity;
          exercise.match_type = 'fuzzy';
          continue;
        }

        // Step 3: No match found
        exercise.matched_exercise_id = null;
        exercise.matched_exercise_name = null;
        exercise.confidence = 0;
        exercise.match_type = 'unmatched';
      }
    }
  }

  return program;
}

// ============================================
// MAIN PIPELINE
// ============================================

export async function parseProgramFromPdf(pdfUrl: string): Promise<{
  program: ParsedProgram;
  stats: {
    total_exercises: number;
    exact_matches: number;
    fuzzy_matches: number;
    unmatched: number;
    average_confidence: number;
  };
}> {
  // Stage 1: Extract
  const markdown = await extractPdfContent(pdfUrl);

  // Stage 2: Parse with LLM
  let program = await parseWithLLM(markdown);

  // Stage 3: Match exercises
  program = await matchExercises(program);

  // Calculate stats
  let total = 0, exact = 0, fuzzy = 0, unmatched = 0, confidenceSum = 0;

  for (const week of program.weeks) {
    for (const day of week.days) {
      for (const exercise of day.exercises) {
        total++;
        confidenceSum += exercise.confidence || 0;
        if (exercise.match_type === 'exact') exact++;
        else if (exercise.match_type === 'fuzzy') fuzzy++;
        else unmatched++;
      }
    }
  }

  return {
    program,
    stats: {
      total_exercises: total,
      exact_matches: exact,
      fuzzy_matches: fuzzy,
      unmatched: unmatched,
      average_confidence: total > 0 ? confidenceSum / total : 0
    }
  };
}
```

### OpenRouter Model Switching

The beauty of OpenRouter is you can switch models without changing code:

```typescript
// Use cheap model for simple PDFs
const result = await parseWithLLM(content, 'google/gemini-2.0-flash');

// Use powerful model for complex PDFs
const result = await parseWithLLM(content, 'anthropic/claude-opus-4.5');

// Auto-fallback if primary model fails
// (configured in the API call with route: 'fallback')
```

**Cost comparison per program:**
| Model | Simple PDF | Complex PDF |
|-------|------------|-------------|
| Gemini Flash | ~$0.05 | ~$0.10 |
| Claude Sonnet | ~$0.30 | ~$0.50 |
| Claude Opus | ~$1.00 | ~$1.50 |
| GPT-4o | ~$0.40 | ~$0.60 |

**Strategy:** Start with Sonnet. If parsing fails or confidence is low, retry with Opus.

### Backend Endpoint (FastAPI)

For MinerU extraction, you'll need a backend endpoint:

```python
# backend/routers/pdf.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os

router = APIRouter(prefix="/pdf", tags=["PDF"])

class ExtractRequest(BaseModel):
    pdf_url: str

class ExtractResponse(BaseModel):
    markdown: str
    pages: int

@router.post("/extract", response_model=ExtractResponse)
async def extract_pdf(request: ExtractRequest):
    """Extract PDF content using MinerU"""

    # Download PDF to temp file
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
        # Download PDF from URL
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(request.pdf_url)
            tmp.write(response.content)
            tmp_path = tmp.name

    try:
        # Run MinerU
        output_dir = tempfile.mkdtemp()
        result = subprocess.run(
            ['magic-pdf', '-p', tmp_path, '-o', output_dir, '-m', 'auto'],
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )

        if result.returncode != 0:
            raise HTTPException(500, f"MinerU failed: {result.stderr}")

        # Read the markdown output
        md_files = [f for f in os.listdir(output_dir) if f.endswith('.md')]
        if not md_files:
            raise HTTPException(500, "No markdown output generated")

        with open(os.path.join(output_dir, md_files[0])) as f:
            markdown = f.read()

        return ExtractResponse(
            markdown=markdown,
            pages=markdown.count('---')  # Rough page count
        )

    finally:
        # Cleanup
        os.unlink(tmp_path)
```

### Testing with Luke's PDFs

Before launching, test with real coach PDFs:

1. **Get sample PDFs** - Ask Luke for 3-5 of his actual programs
2. **Run through pipeline** - Check accuracy of extraction
3. **Measure confidence** - Target: 90%+ exercises matched
4. **Iterate on prompt** - Add examples of common issues to system prompt
5. **Build edge case handling** - Supersets, EMOM, rest days

---

## 20. Coach Portal MVP Specification

### Decisions Made ✅ (Updated Jan 29)

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Architecture** | Separate repos | Don't want desktop changes affecting mobile |
| **Framework** | Expo (web) | Reuse components, preview accuracy, future mobile portal |
| **Program Creation** | PDF upload only | No manual builder for MVP |
| **Preview** | Identical to mobile | Copy ProgramPreviewSheet, adapt for desktop |
| **Auth** | Skip for MVP | Build UI first, add auth later |
| **Payments** | Skip for MVP | Add Stripe after core flow works |
| **PDF Parsing** | MinerU + OpenRouter | 90%+ accuracy target, model flexibility |
| **MinerU Host** | Existing Hybrid Base backend | Add endpoint to current FastAPI server |
| **Database** | Same Supabase project | Shared exercises, shared users |
| **Unknown Exercises** | Auto-create with tag | Flag `is_auto_created: true` for review later |
| **Exercise Editing** | Full inline editing | Change exercise, sets, reps, rest, notes in review screen |
| **After Publish** | Save to database | Programs stored in `coach_programs`. Mobile app UI later. |
| **Credentials** | Skip for MVP | Just name, bio, photo, social links |
| **Duplicate Feature** | Skip for MVP | Coaches upload fresh each time |
| **PDF Limits** | None for MVP | Add limits if issues arise |
| **Demo Timeline** | Next Tuesday | Show progress to Luke/Ian ASAP |

### Scope Summary

| Feature | In MVP | Notes |
|---------|--------|-------|
| PDF Upload + AI Parsing | ✅ Yes | MinerU → OpenRouter → 90%+ accuracy |
| Coach Profile | ✅ Yes | Name, bio, photo, social links (NO credentials for MVP) |
| Program Dashboard | ✅ Yes | List programs, status, stats placeholder |
| Program Preview | ✅ Yes | Copy mobile app components for accurate preview |
| Exercise Review UI | ✅ Yes | Full inline editing: exercise, sets, reps, rest, notes |
| Unknown Exercise Handling | ✅ Yes | Auto-create with `is_auto_created` flag |
| Save to Database | ✅ Yes | Programs saved to `coach_programs` table |
| Auth/Users | ❌ No | Build UI first, add Supabase auth later |
| Stripe Payments | ❌ No | Add after MVP validated |
| Manual Program Builder | ❌ No | PDF-first approach |
| Real Analytics | ❌ No | Placeholder only ("Coming Soon") |
| Credentials | ❌ No | Defer to post-MVP |
| Program Duplication | ❌ No | Defer to post-MVP |
| Mobile App UI (user-facing) | ❌ No | Build coach portal first, mobile changes later |

### Unknown Exercise Auto-Creation

When the parsing pipeline can't match an exercise:

```sql
-- Modified exercises table (add flag)
ALTER TABLE exercises ADD COLUMN is_auto_created BOOLEAN DEFAULT FALSE;
ALTER TABLE exercises ADD COLUMN auto_created_by UUID REFERENCES coaches(id);
ALTER TABLE exercises ADD COLUMN auto_created_at TIMESTAMPTZ;

-- When inserting auto-created exercise
INSERT INTO exercises (
  name,
  name_normalized,
  slug,
  provider_source,
  provider_id,
  is_auto_created,
  auto_created_by,
  auto_created_at
) VALUES (
  'Pec Deck Machine',                    -- raw name from PDF
  'pec deck machine',                    -- normalized
  'auto-pec-deck-machine-abc123',        -- unique slug
  'coach_upload',                        -- source
  'auto-abc123',                         -- unique ID
  TRUE,                                  -- flag for review
  '...',                                 -- coach who uploaded
  NOW()
);
```

**Admin Review (Later):**
- Query: `SELECT * FROM exercises WHERE is_auto_created = TRUE`
- Options: Approve (remove flag), merge with existing, or delete

### Tech Stack (Final)

| Layer | Choice | Notes |
|-------|--------|-------|
| **Repo** | `hybrid-base-coach-portal` (new) | Separate from mobile app |
| **Framework** | Expo SDK 54 | Same as mobile, works on web |
| **Routing** | Expo Router | File-based routing |
| **State** | Zustand | Copy relevant stores from mobile |
| **Styling** | StyleSheet + Platform.select | Adapt mobile styles for desktop |
| **Database** | Supabase (shared) | Same project as mobile app |
| **PDF Parsing** | MinerU + Claude Sonnet | Two-stage pipeline |
| **File Storage** | Supabase Storage | PDFs, profile photos |
| **Deploy** | Vercel | Expo web output |

### Repo Setup

```bash
# Create new repo
mkdir hybrid-base-coach-portal
cd hybrid-base-coach-portal

# Initialize Expo
npx create-expo-app@latest . --template blank-typescript

# Copy components from mobile (one-time)
# - ProgramPreviewSheet.tsx
# - WorkoutDetailDrawer.tsx
# - ExercisePicker.tsx
# - coachTypes.ts
# - exerciseMatching.ts

# Configure for web
npx expo install react-dom react-native-web @expo/metro-runtime

# Add Supabase
npx expo install @supabase/supabase-js
```

### Database Tables (New)

These tables will be added to the existing Supabase project:

```sql
-- Coach profiles (MVP version - no Stripe fields yet)
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE,  -- nullable for MVP (no auth)

  -- Profile
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  credentials JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',

  -- Status
  verification_status TEXT DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach programs (MVP version - no pricing yet)
CREATE TABLE coach_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches NOT NULL,

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content
  duration_weeks INT NOT NULL,
  difficulty TEXT,
  focus TEXT[],
  equipment TEXT[],

  -- The program data (same structure as mobile routines)
  template_data JSONB NOT NULL,

  -- Source
  source_pdf_url TEXT,  -- Original uploaded PDF

  -- Status
  status TEXT DEFAULT 'draft',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(coach_id, slug)
);
```

### PDF Parsing Pipeline

```
┌─────────────────┐
│  Coach uploads  │
│     PDF         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upload to      │
│  Supabase       │
│  Storage        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MinerU         │  ← Stage 1: Extract structure
│  Extraction     │     (tables, text, layout)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude Sonnet  │  ← Stage 2: Process into schema
│  Processing     │     (weeks, days, exercises)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Exercise       │  ← Stage 3: Match to database
│  Matching       │     (fuzzy + embeddings)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Coach Review   │  ← Human review with confidence UI
│  UI             │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to        │
│  coach_programs │
└─────────────────┘
```

**Cost per program:** ~$0.50-1.50 (extraction + Claude processing)

### User Flows

**Flow 1: First-Time Profile Setup**
```
1. Land on portal (no login required for MVP)
2. Click "Create Coach Profile"
3. Enter display name
4. Upload profile photo
5. Write bio
6. Add credentials (certifications, experience)
7. Add social links (Instagram, TikTok, YouTube, Twitter)
8. Save profile → redirect to dashboard
```

**Flow 2: Upload Program**
```
1. Click "New Program" on dashboard
2. Enter basic info:
   - Title
   - Description
   - Duration (weeks)
   - Difficulty
   - Focus areas
   - Equipment needed
3. Upload PDF file
4. Loading state: "Parsing your program..."
5. AI extracts → shows structured result
6. Coach reviews each exercise:
   - ✅ Green = high confidence match
   - ⚠️ Yellow = medium confidence (can change)
   - ❌ Red = no match (must select from list)
7. Coach makes corrections
8. Click "Preview" → see exactly how it looks in mobile app
9. Click "Save as Draft" or "Publish"
```

**Flow 3: Manage Programs**
```
1. Dashboard shows all programs
2. Each program card shows:
   - Title, duration, status
   - "Stats coming soon" placeholder
3. Actions per program:
   - Edit
   - Preview
   - Publish/Unpublish
   - Archive
```

### Key Screens

| Screen | Purpose | Key Components |
|--------|---------|----------------|
| **Dashboard** | Program list, quick actions | ProgramCard, EmptyState, "New Program" button |
| **Profile Setup** | Create/edit coach profile | ImageUpload, TextInput, CredentialsList, SocialLinks |
| **Program Info** | Basic program details | Form with title, description, difficulty, etc. |
| **PDF Upload** | Upload and parse PDF | FileUpload, LoadingState, ErrorState |
| **Program Review** | Review AI-parsed result | ExerciseList with confidence badges, ExercisePicker |
| **Program Preview** | Mobile app view | ProgramPreviewSheet (copied from mobile) |
| **Program Editor** | Edit existing program | Same as Review but for existing programs |

### Exercise Review UI

The key differentiator - coaches must be able to review and fix AI parsing:

```
┌────────────────────────────────────────────────────────┐
│  Week 1, Day 1 - "Push Day"                            │
├────────────────────────────────────────────────────────┤
│  ✅ Barbell Bench Press                                │
│     4 sets × 8-10 reps • 90s rest                      │
│                                           [Edit] [✕]   │
├────────────────────────────────────────────────────────┤
│  ⚠️ "Incline DB Press" → Incline Dumbbell Press       │
│     3 sets × 10-12 reps • 60s rest                     │
│     Confidence: 85%                [Change] [Edit] [✕] │
├────────────────────────────────────────────────────────┤
│  ❌ "Pec Deck" → No match found                        │
│     3 sets × 12-15 reps • 45s rest                     │
│                          [Select Exercise] [Edit] [✕]  │
├────────────────────────────────────────────────────────┤
│  [+ Add Exercise]                                      │
└────────────────────────────────────────────────────────┘
```

**Confidence Thresholds:**
- ✅ Green: >90% match confidence
- ⚠️ Yellow: 70-90% (matched but coach should verify)
- ❌ Red: <70% or no match (must manually select)

### Components to Copy from Mobile

| Component | Size | What to Adapt |
|-----------|------|---------------|
| `ProgramPreviewSheet.tsx` | 30KB | Remove bottom sheet, use full page. Add desktop width constraints. |
| `WorkoutDetailDrawer.tsx` | 32KB | Remove drawer animation, use modal or inline. |
| `ExercisePicker.tsx` | ~15KB | Keep search, add keyboard navigation for desktop. |
| `coachTypes.ts` | ~5KB | No changes needed. |
| `exerciseMatching.ts` | ~3KB | No changes needed. |

### Desktop-Specific Adaptations

```tsx
// Example: Responsive layout
import { Platform, useWindowDimensions } from 'react-native';

function DashboardLayout({ children }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 1024;

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <Sidebar />
        <View style={styles.mainContent}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileContainer}>
      <TopNav />
      {children}
      <BottomTabs />
    </View>
  );
}
```

### File Structure

```
hybrid-base-coach-portal/
├── app/                          # Expo Router pages
│   ├── index.tsx                 # Landing / Dashboard
│   ├── profile/
│   │   ├── setup.tsx             # First-time setup
│   │   └── edit.tsx              # Edit profile
│   ├── programs/
│   │   ├── index.tsx             # Program list
│   │   ├── new/
│   │   │   ├── info.tsx          # Step 1: Basic info
│   │   │   ├── upload.tsx        # Step 2: PDF upload
│   │   │   └── review.tsx        # Step 3: Review parsed
│   │   ├── [id]/
│   │   │   ├── index.tsx         # Program detail
│   │   │   ├── edit.tsx          # Edit program
│   │   │   └── preview.tsx       # Mobile preview
│   │   └── _layout.tsx
│   └── _layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Desktop sidebar nav
│   │   ├── TopNav.tsx            # Mobile top nav
│   │   └── DashboardLayout.tsx   # Responsive container
│   ├── program/
│   │   ├── ProgramCard.tsx       # Dashboard card
│   │   ├── ProgramPreviewSheet.tsx  # (copied from mobile)
│   │   ├── WorkoutDetailDrawer.tsx  # (copied from mobile)
│   │   └── ExerciseReviewList.tsx   # Review UI with confidence
│   ├── profile/
│   │   ├── ProfileForm.tsx
│   │   ├── CredentialsList.tsx
│   │   └── SocialLinksForm.tsx
│   ├── upload/
│   │   ├── PDFUploader.tsx
│   │   └── ParsingProgress.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── coachTypes.ts             # (copied from mobile)
│   ├── exerciseMatching.ts       # (copied from mobile)
│   └── pdfParsing.ts             # MinerU + Claude pipeline
├── state/
│   ├── useCoachStore.ts          # Coach profile state
│   └── useProgramStore.ts        # Program editing state
└── package.json
```

### Build Order (Tuesday Demo Target 🎯)

**Goal:** Working demo for Luke/Ian by Tuesday, Feb 4

| Day | Date | What to Build | Must Have for Demo |
|-----|------|---------------|-------------------|
| **1** | Thu Jan 30 | Setup: repo, Expo, Supabase, file structure | ✅ |
| **2** | Fri Jan 31 | PDF Pipeline: MinerU endpoint + OpenRouter parsing | ✅ |
| **3** | Sat Feb 1 | Exercise matching + basic review UI | ✅ |
| **4** | Sun Feb 2 | Dashboard + profile (minimal) | ✅ |
| **5** | Mon Feb 3 | Preview + polish + test with Luke's PDFs | ✅ |
| **6** | Tue Feb 4 | **DEMO DAY** - Bug fixes, prep | 🎯 |

### Demo Scope (Realistic for 6 Days)

**Focus: Coach Portal ONLY** - Mobile app UI changes come later.

**Must show on Tuesday:**
- [ ] Upload a PDF (Luke's actual program)
- [ ] See it parsed into structured program
- [ ] Review exercises with confidence indicators
- [ ] Fix any unmatched exercises inline
- [ ] Preview how it looks (copy mobile components for accuracy)
- [ ] Save/publish to database

**Can be rough/placeholder:**
- Profile (hardcoded test coach)
- Dashboard (simple list)
- Error handling (basic)

**Skip entirely for demo:**
- Auth
- Multiple coaches
- Edit existing programs
- Mobile app changes (user-facing UI)

### Preview UI

The preview in the coach portal should copy mobile app components so coaches can see exactly how their program will look:

**Components to copy:**
- `ProgramPreviewSheet.tsx` - Week/day/workout structure
- `WorkoutDetailDrawer.tsx` - Individual workout view

**After publish flow (MVP):**
```
Coach publishes → Program saved to coach_programs table
                → Done (for now)

Later: Mobile app will query coach_programs and display to users
```

### Post-Demo Build Order

After Tuesday, continue building:

| Phase | What to Build | Estimate |
|-------|---------------|----------|
| **7. Profile** | Full profile setup/edit | 2 days |
| **8. Dashboard** | Proper program cards, stats placeholder | 2 days |
| **9. Polish** | Responsive layout, loading states, errors | 3 days |
| **10. Auth** | Supabase auth integration | 2 days |

**Full MVP:** ~2 weeks after demo

### Success Criteria

| Metric | Target |
|--------|--------|
| PDF parsing accuracy | 90%+ exercises correctly matched |
| Preview fidelity | Shows program structure clearly |
| Upload flow | < 60 seconds from PDF to preview |
| Demo impact | Luke/Ian excited about what they see |

### What's NOT in MVP (Deferred)

| Feature | When to Add |
|---------|-------------|
| Authentication | After demo |
| Stripe payments | After auth |
| Manual program builder | If coaches request it |
| Analytics dashboard | After we have real users |
| AI-powered updates | After subscriptions work |
| Coach vetting system | Phase 2 (open applications) |
| Reviews and ratings | After marketplace launches |
| Credentials field | Post-MVP |
| Program duplication | Post-MVP |

---

## Next Steps

### All Decisions Made ✅ (Jan 29, 2026)

**Architecture & Stack:**
- [x] Separate repos (not monorepo) - desktop changes won't affect mobile
- [x] Expo for web - reuse components, preview accuracy
- [x] Same Supabase project - shared database with mobile
- [x] MinerU on existing Hybrid Base backend - add endpoint to FastAPI

**MVP Scope:**
- [x] PDF upload only (no manual builder)
- [x] MinerU + OpenRouter (model flexibility)
- [x] Full inline editing in review UI
- [x] Auto-create unknown exercises with `is_auto_created` flag
- [x] Skip auth for MVP
- [x] Skip payments for MVP
- [x] Skip credentials for MVP
- [x] Skip duplicate feature for MVP
- [x] No PDF limits for MVP

**Testing:**
- [x] Use Luke's actual PDFs (Kyle has them)
- [x] Demo to Luke/Ian: **Next Tuesday (Feb 4)**

### Day 1 Action Items (Thu Jan 30)

1. **Create new repo:** `hybrid-base-coach-portal`
2. **Initialize Expo app** with web support
3. **Copy components** from mobile:
   - `ProgramPreviewSheet.tsx`
   - `WorkoutDetailDrawer.tsx`
   - `coachTypes.ts`
   - Exercise matching utilities
4. **Set up Supabase connection** (same project as mobile)
5. **Add MinerU endpoint** to existing FastAPI backend

### Test PDFs

Location of Luke's programs: Check `02_Areas/Hybrid Base/Partnership/Luke Hopkins/` for Inner Flame PDFs or ask Kyle for the exact files.
6. **Build screens** in order:
   - Layout (responsive, sidebar)
   - Profile setup/edit
   - Dashboard
   - Program upload flow
   - Review UI with confidence indicators
   - Preview (adapted mobile component)

### For Tuesday Call with Luke/Ian

Share these sections:
- Executive Summary
- Business Model Options (get input on rake %)
- Open Questions (naming, refunds, exclusivity)
- MVP scope summary

Still need answers on:
- Rake percentage (5-10% vs 15% vs 20%)
- Platform naming (replacing "Hybrid Base")
- Refund policy
- Subscription update frequency
- Exclusivity (can coaches sell elsewhere?)

### After MVP Built

1. Demo to Luke/Ian
2. Add Supabase auth
3. Add Stripe Connect for payments
4. Test with real coach PDFs
5. Launch Phase 1 (invite-only coaches)

---

*Document created: January 28, 2026*
*Last updated: January 29, 2026*
