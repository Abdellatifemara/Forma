# FitApp - Payment System

## 1. Overview

FitApp handles all payments in-app (like Uber model):
- Clients pay through the app
- Platform holds funds
- Trainers withdraw earnings
- Platform takes commission (varies by trainer tier)

---

## 2. Subscription Tiers

### 2.1 Free Tier
No payment required.

| Feature | Included |
|---------|----------|
| Food & exercise database | ✓ |
| Basic meal & workout logging | ✓ |
| History | 7 days only |
| Trainer marketplace | ✗ |
| Health graphs | ✗ |
| Ads | Shown |

### 2.2 Free Trial (7 Days)
Available to new users only, one-time.

| Feature | Included |
|---------|----------|
| All Premium features | ✓ |
| Duration | 7 days |
| Auto-renewal | No - converts to Free |
| Credit card required | No |

### 2.3 Premium Subscription

| Plan | Price (EGP) | Savings |
|------|-------------|---------|
| Monthly | 99 | - |
| Quarterly | 249 | 16% |
| Yearly | 799 | 33% |

**Includes:**
- Trainer marketplace access
- Request and hire trainers
- **Automatic warmups** (muscle-specific, can disable)
- **Limited AI usage** (equipment change, meal suggestions - limits TBD)
- Advanced analytics & health graphs
- Unlimited history
- Ad-free experience
- Priority support

### 2.4 Premium+ Subscription (The Ultimate Experience)

| Plan | Price (EGP) | Savings |
|------|-------------|---------|
| Monthly | 199 | - |
| Quarterly | 499 | 16% |
| Yearly | 1,599 | 33% |

**Your body. Your goals. Zero limits.**

**Unlimited AI Power:**
- Change your workout anytime - no daily limits
- Generate meals on demand
- Swap exercises instantly
- Your AI personal trainer, always available

**Weak Spot Targeting:**
- Tell us your weak areas during onboarding
- AI builds custom programs to strengthen them
- Watch your weaknesses become strengths

**Complete Add-on Library:**
| Add-on | What You Get |
|--------|--------------|
| Kegel & Pelvic Power | Core strength from the inside out |
| Yoga & Flow Sessions | Flexibility meets inner peace |
| Post-Workout Recovery | Cool down like a pro |
| Mobility Mastery | Move better, feel younger |
| Recovery Protocols | Bounce back faster |
| Guided Meditation | Clear mind, strong body |
| Breathwork Training | Oxygen is power |
| Posture Perfection | Stand tall, look confident |
| Self-Massage & Foam Rolling | Your personal recovery toolkit |
| Balance & Coordination | Athletic precision |
| Sport-Specific Training | Train like an athlete |

**Premium+ Exclusives:**
- Lifetime data history - your journey, forever
- Multiple trainers - nutrition + workout coaches together
- Priority trainer matching - best trainers, first access
- Exclusive programs - workouts you won't find anywhere else
- Early access - be first to try new features
- Export everything - your data is yours
- Premium+ badge - show the world you're serious

**Note:** Premium+ cannot be gifted - must always be paid.

---

## 3. Trainer Payment Types

### 3.1 Standard Trainers (via App)
Trainers who applied through normal verification.

| Period | How It Works |
|--------|--------------|
| Weekly | Client pays weekly rate, renews each week |
| Monthly | Client pays monthly rate, renews each month |

### 3.2 Partner Trainers (Invited)
Famous trainers invited by founders.
- Same payment flow as standard
- 5% fee only (keep 95%) - covers payment processing
- Can gift Premium to their clients

---

## 4. Commission Structure

### 4.1 Standard Trainers

Fixed commission for all standard trainers:

| Fee | Trainer Keeps | Covers |
|-----|---------------|--------|
| **15%** | **85%** | Payment processing + platform costs |

**Breakdown of 15%:**
- Payment processing (Paymob): ~3%
- AI/Server costs: ~5%
- Platform operations: ~7%

**Example:**
- Trainer charges: EGP 1,000/week
- Platform takes: EGP 150 (15%)
- Trainer receives: EGP 850

**Note:** Trainers handle their own taxes. Platform does not withhold.

### 4.2 Partner Trainers

| Fee | Trainer Keeps | Covers |
|-----|---------------|--------|
| **5%** | **95%** | Payment processing (~3%) + minimal costs |

**Partner Benefits:**
- Only 5% fee (vs 15% for standard)
- Can gift Premium (not Premium+) to their subscribed clients
- Featured placement in trainer discovery
- Invitation only - must be invited by Super Admin

**Example:**
- Trainer charges: EGP 1,000/week
- Platform takes: EGP 50 (5%)
- Trainer receives: EGP 950

### 4.3 Platform Taxes

- Platform pays taxes on net profit (revenue - costs - payouts)
- Tax percentage: TBD (based on Egyptian tax regulations)

---

## 5. Payment Methods (Egypt)

### 5.1 Supported Payment Methods

| Method | Type | Availability |
|--------|------|--------------|
| Credit/Debit Card | Visa, Mastercard | Launch |
| Vodafone Cash | Mobile Wallet | Launch |
| Fawry | Cash/Online | Launch |
| InstaPay | Bank Transfer | Launch |
| Orange Money | Mobile Wallet | Phase 2 |
| Etisalat Cash | Mobile Wallet | Phase 2 |
| Meeza | Debit Card | Phase 2 |

### 5.2 Payment Gateway

**Recommendation:** **Paymob** - covers all Egyptian payment methods.

| Provider | Pros | Cons |
|----------|------|------|
| **Paymob** | Egypt-focused, all local methods | - |
| **Fawry** | Trusted, cash payment | Limited to Fawry |
| **Accept** | Local, good support | - |

---

## 6. Payment Flows

### 6.1 Free Trial Flow

```
New user signs up
    ↓
Complete onboarding
    ↓
Free trial activated (7 days)
    ↓
Day 5: Notification "2 days left"
    ↓
Day 7: Trial ends
    ↓
├── Subscribe → Premium or Premium+ activated
└── No action → Convert to Free tier
```

### 6.2 Subscription Flow

```
User clicks "Subscribe"
    ↓
Select tier: Premium or Premium+
    ↓
Select period: Monthly / Quarterly / Yearly
    ↓
Select payment method
    ↓
Confirm payment
    ↓
Payment processed
    ↓
Subscription active
    ↓
Auto-renewal set up
```

### 6.3 Trainer Payment Flow

```
1. Client requests trainer (Premium/Premium+ only)
    ↓
2. Trainer accepts request
    ↓
3. Payment screen shown to client
    - Amount: [Trainer's rate]
    - Period: Weekly/Monthly
    - Method: [Select payment method]
    ↓
4. Client confirms payment
    ↓
5. Payment processed via gateway
    ↓
6. If successful:
    - Receipt sent to client
    - Trainer notified
    - Relationship activated
    - Chat & Timeline unlocked
    - Funds held in escrow (7 days)
    ↓
7. If failed:
    - Error shown to client
    - Retry option
    - Trainer not notified
```

### 6.4 Recurring Payments

```
Weekly/Monthly subscription
    ↓
Period ends
    ↓
Auto-charge attempt
    ↓
├── Success → Renewal confirmed, continue
└── Failed → Notify client, 3-day grace period
                ↓
            Grace period expired
                ↓
            Relationship paused
            Client must pay to continue
```

### 6.5 Hold Period

All trainer payments held for **7 days minimum** before withdrawal.

**Why?**
- Dispute window
- Refund protection
- Fraud prevention

```
Day 0: Client pays EGP 1,000
Day 0-7: Funds in hold (cannot withdraw)
Day 7+: Available after commission deduction
```

---

## 7. Trainer Payouts

### 7.1 Withdrawal Process

```
1. Trainer opens "Earnings"
    ↓
2. Sees available balance
    ↓
3. Clicks "Withdraw"
    ↓
4. Enters amount (min EGP 100)
    ↓
5. Selects payout method
    - Bank account
    - Vodafone Cash
    - InstaPay
    ↓
6. Confirms withdrawal
    ↓
7. Processing (1-3 business days)
    ↓
8. Funds received
    ↓
9. Receipt/notification sent
```

### 7.2 Payout Methods

| Method | Processing Time | Fees |
|--------|-----------------|------|
| Bank Transfer | 1-3 business days | Free |
| Vodafone Cash | Instant - 24 hours | 1% (max EGP 50) |
| InstaPay | Instant - 24 hours | Free |
| Orange Money | Instant - 24 hours | 1% (max EGP 50) |

### 7.3 Payout Limits

| Limit | Amount |
|-------|--------|
| Minimum withdrawal | EGP 100 |
| Maximum per transaction | EGP 50,000 |
| Maximum per day | EGP 100,000 |
| Maximum per month | EGP 500,000 |

---

## 8. Premium Gifting

### 8.1 Who Can Gift?

| Gifter | Can Gift Premium? | Can Gift Premium+? |
|--------|-------------------|-------------------|
| Super Admin | ✓ Yes | ✗ No |
| Partner Trainer | ✓ To their clients only | ✗ No |
| Standard Trainer | ✗ No | ✗ No |
| Regular User | ✗ No | ✗ No |

### 8.2 Gift Flow (Partner Trainer)

```
Partner Trainer Dashboard
    ↓
Select subscribed client
    ↓
"Gift Premium" button
    ↓
Confirmation:
    "Gift 1 month of Premium to [Client]?
     Note: Premium+ cannot be gifted."
    ↓
Confirm
    ↓
Client notified
    ↓
Client's Premium extended by 1 month
```

### 8.3 Gift Flow (Super Admin)

```
Super Admin Panel
    ↓
"Gift Premium" action
    ↓
Search any user
    ↓
Select duration (1 month)
    ↓
Confirm
    ↓
User receives Premium
```

### 8.4 Important Rules

- **Premium+ can NEVER be gifted** - must always be paid
- Partner trainers can only gift to their own subscribed clients
- Super Admins can gift to anyone
- Gift duration: 1 month per gift
- Gifts extend existing subscription (don't replace)

---

## 9. Refunds & Disputes

### 9.1 Refund Policy

| Situation | Refund |
|-----------|--------|
| Trainer unresponsive (48+ hours) | Full refund |
| Client cancels within 24 hours | Full refund |
| Client cancels after 24 hours | Prorated refund |
| Trainer inappropriate behavior | Full refund + trainer action |
| Free trial | No refund (it's free) |
| Premium subscription | Prorated for unused time |
| Premium+ subscription | Prorated for unused time |

### 9.2 Dispute Process

```
1. Client opens dispute
    ↓
2. Selects reason
    - Trainer not responding
    - Poor quality coaching
    - Inappropriate behavior
    - Payment issue
    - Other
    ↓
3. Provides details + evidence
    ↓
4. Trainer notified
    ↓
5. Trainer can respond (48 hours)
    ↓
6. Admin reviews case
    ↓
7. Decision made:
    - Dismiss (no action)
    - Partial refund
    - Full refund
    - Warning to trainer
    - Trainer suspended/banned
```

### 9.3 Refund Impact on Trainer

| Refund Type | Impact |
|-------------|--------|
| Client's fault | No impact on trainer |
| Trainer's fault | Funds deducted, warning issued |
| Disputed | Funds held until resolved |

---

## 10. Financial Dashboard (Admin)

### 10.1 Revenue Metrics

- Total revenue (daily/weekly/monthly)
- Subscription revenue (Premium vs Premium+)
- Commission earned (by tier)
- Active subscriptions by tier
- Free trial conversion rate
- Average payment value
- Refund rate

### 10.2 Payout Tracking

- Pending payouts
- Processed payouts
- Failed payouts
- Total paid to trainers
- Partner trainer earnings (0% commission)

### 10.3 Fraud Detection

Flags for:
- Multiple failed payments
- Unusual payment patterns
- Rapid signup + high payment
- Multiple accounts from same device
- Chargebacks

---

## 11. Invoices & Tax

### 11.1 Client Receipts

After each payment:
- Email receipt
- In-app receipt
- Payment history

### 11.2 Trainer Earnings Report

Monthly statement showing:
- All earnings
- Commission deducted (by tier)
- Withdrawals
- Net income
- Client breakdown

### 11.3 Tax Considerations

- Platform provides earnings summary
- Trainers responsible for own taxes
- Future: Integration with Egyptian tax requirements

---

## 12. Security

### 12.1 Payment Security

- PCI DSS compliant gateway
- No card data stored on our servers
- Tokenization for recurring payments
- 3D Secure for card payments

### 12.2 Fraud Prevention

- Device fingerprinting
- Velocity checks (too many attempts)
- Address verification
- Risk scoring

### 12.3 Data Protection

- Encrypted payment data
- Secure payout details storage
- Access logging
- Regular security audits
