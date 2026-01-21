# FitApp - Admin Panel

## 1. Overview

The admin panel is the control center for platform operations:
- Trainer verification (human only)
- Dispute resolution
- User management
- Content moderation
- Analytics & reporting
- Platform configuration
- **Super Admin special powers**

---

## 2. Admin Roles

### 2.1 Role Hierarchy

| Role | Access Level |
|------|--------------|
| **Super Admin** | Full access + special powers (founders only) |
| **Operations Admin** | Verifications, disputes, user management |
| **Support Admin** | View-only + respond to tickets |
| **Finance Admin** | Payments, payouts, refunds |
| **Content Admin** | Content moderation, reports |

### 2.2 Super Admin (Founders Only)

**Only for: Abdellatif & Dodoelmahdy**

| Power | Description |
|-------|-------------|
| Grant Partner status | Give any trainer 0% commission |
| Revoke Partner status | Return trainer to standard commission |
| Gift Premium | Give free Premium to any user |
| Cannot gift Premium+ | Premium+ must always be paid |
| Override verification | Instantly approve/reject trainers |
| Manage admins | Create/remove admin accounts |
| All analytics | Full platform visibility |
| Platform settings | All configuration options |

### 2.3 Permission Matrix

| Feature | Super | Ops | Support | Finance | Content |
|---------|-------|-----|---------|---------|---------|
| Verify trainers | ✓ | ✓ | - | - | - |
| Handle disputes | ✓ | ✓ | View | - | - |
| Ban users | ✓ | ✓ | - | - | - |
| Issue refunds | ✓ | - | - | ✓ | - |
| View payments | ✓ | ✓ | View | ✓ | - |
| Moderate content | ✓ | ✓ | - | - | ✓ |
| View analytics | ✓ | ✓ | ✓ | ✓ | ✓ |
| Platform settings | ✓ | - | - | - | - |
| Manage admins | ✓ | - | - | - | - |
| **Grant Partner status** | ✓ | - | - | - | - |
| **Gift Premium** | ✓ | - | - | - | - |

---

## 3. Dashboard (Home)

### 3.1 Overview Widgets

```
┌─────────────────────────────────────────────────────────┐
│  FitApp Admin Dashboard                                 │
│  [Super Admin] (if applicable)                          │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 12,450  │ │  1,247  │ │   156   │ │   EGP   │       │
│  │  Total  │ │ Premium │ │Verified │ │ 245,000 │       │
│  │  Users  │ │ + Trial │ │Trainers │ │ Revenue │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
│  ⚠️ Requires Attention                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │    8    │ │    3    │ │    5    │                   │
│  │ Pending │ │  Open   │ │Reported │                   │
│  │ Verify  │ │Disputes │ │ Content │                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
│  💰 Revenue Breakdown                                   │
│  Premium: EGP 84,000 | Premium+: EGP 42,000            │
│  Commissions: EGP 119,000                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Quick Actions

- Review pending trainer verifications
- View open disputes
- Check reported content
- View recent payments
- **[Super Admin] Grant Partner status**
- **[Super Admin] Gift Premium**

### 3.3 Activity Feed

Recent admin actions:
- "[Admin] approved trainer [Name]"
- "[Admin] resolved dispute #123"
- "[Super Admin] granted Partner status to [Trainer]"
- "[Super Admin] gifted Premium to [User]"

---

## 4. Super Admin Special Actions

### 4.1 Grant Partner Status

**Purpose:** Make famous trainers partners (0% commission + gifting powers)

```
┌─────────────────────────────────────────────────────────┐
│  🌟 Grant Partner Status                                │
│                                                         │
│  Search Trainer: [_______________________] [Search]     │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Selected: Ahmed Hassan                                │
│  Current status: Standard Trainer (20% commission)     │
│  Rating: 4.8 ⭐ | Clients: 45 | Earnings: EGP 85,000   │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Partner Benefits:                                      │
│  ✓ 0% commission (keep 100%)                           │
│  ✓ Can gift Premium to their clients                   │
│  ✓ Featured in trainer discovery                       │
│  ✓ Priority verification                               │
│                                                         │
│  Reason for Partner status:                            │
│  [_________________________________________]            │
│  (e.g., "Famous Instagram trainer, 100K followers")    │
│                                                         │
│  [Cancel]              [Grant Partner Status]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Revoke Partner Status

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Revoke Partner Status                              │
│                                                         │
│  Trainer: Ahmed Hassan                                 │
│  Partner since: Jan 1, 2026                            │
│  Total earnings (0% commission): EGP 150,000           │
│                                                         │
│  After revocation:                                      │
│  - Commission returns to tier-based rate               │
│  - Cannot gift Premium anymore                         │
│  - Removed from featured placement                     │
│  - Current clients not affected                        │
│                                                         │
│  Reason for revocation:                                │
│  [_________________________________________]            │
│                                                         │
│  [Cancel]              [Revoke Partner Status]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Gift Premium to User

**Note:** Premium+ can NEVER be gifted.

```
┌─────────────────────────────────────────────────────────┐
│  🎁 Gift Premium                                        │
│                                                         │
│  Search User: [_______________________] [Search]        │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Selected: Mohamed Ali                                 │
│  Current status: Free User                             │
│  Joined: Dec 15, 2025                                  │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Gift Options:                                          │
│  ○ 1 Month Premium                                     │
│  ○ 3 Months Premium                                    │
│  ○ 6 Months Premium                                    │
│                                                         │
│  ⚠️ Premium+ cannot be gifted                          │
│                                                         │
│  Reason for gift:                                       │
│  [_________________________________________]            │
│  (e.g., "Promotional campaign", "VIP user")            │
│                                                         │
│  [Cancel]                      [Gift Premium]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Manage Admins

```
┌─────────────────────────────────────────────────────────┐
│  👥 Admin Management                                    │
│                                                         │
│  Current Admins:                                        │
│                                                         │
│  Abdellatif ⭐ Super Admin (cannot remove)             │
│  Dodoelmahdy ⭐ Super Admin (cannot remove)            │
│                                                         │
│  Sara Ahmed - Operations Admin                         │
│  [Edit Role] [Remove]                                  │
│                                                         │
│  Omar Khaled - Finance Admin                           │
│  [Edit Role] [Remove]                                  │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  [+ Add New Admin]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Trainer Verification (Human Review)

### 5.1 Verification Queue

```
┌─────────────────────────────────────────────────────────┐
│  Pending Verifications (8)                              │
│                                                         │
│  ⚠️ Human verification only - no AI                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Photo] Ahmed Hassan                             │   │
│  │ Submitted: 2 hours ago                           │   │
│  │ Specializations: Calisthenics, Weight Loss       │   │
│  │ Certifications: 2 uploaded                       │   │
│  │ Instagram: @ahmed_fitness                        │   │
│  │                                                  │   │
│  │ [View Full Application]  [Quick Approve]         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Application Review Screen

```
┌─────────────────────────────────────────────────────────┐
│  Trainer Application: Ahmed Hassan                      │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  📷 Profile Photo                                      │
│  [Photo display]                                       │
│  ☐ Clear, professional                                │
│  ☐ Face visible                                       │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  📱 Instagram: @ahmed_fitness                          │
│  [Open Instagram in new tab]                           │
│  ☐ Account exists                                     │
│  ☐ Fitness content                                    │
│  ☐ Active (recent posts)                              │
│  ☐ Follower count reasonable                          │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  📜 Certifications                                     │
│                                                         │
│  1. NASM CPT                                          │
│     [View Document - Full Screen]                     │
│     ☐ Document readable                               │
│     ☐ Appears legitimate                              │
│     ☐ Name matches                                    │
│                                                         │
│  2. Precision Nutrition L1                            │
│     [View Document - Full Screen]                     │
│     ☐ Document readable                               │
│     ☐ Appears legitimate                              │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  📝 Bio                                               │
│  "I've been training for 5 years..."                  │
│  ☐ Professional writing                               │
│  ☐ No false claims                                    │
│  ☐ No red flags                                       │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  💰 Pricing                                           │
│  Weekly: EGP 1,500 | Monthly: EGP 5,000              │
│  ☐ Reasonable for experience level                    │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Decision:                                              │
│                                                         │
│  [✓ Approve]  [✗ Reject]  [? Request More Info]       │
│                                                         │
│  Rejection reason (if rejecting):                      │
│  [Dropdown: Select reason]                             │
│  [Text: Additional notes]                              │
│                                                         │
│  [Super Admin Only]                                    │
│  ☐ Also grant Partner status (0% commission)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Rejection Templates

Pre-written rejection reasons:
- "Certificate documents are unclear. Please upload clearer images."
- "Instagram account appears inactive or unrelated to fitness."
- "Certification is not from a recognized organization."
- "Profile photo does not meet our guidelines."
- "Incomplete application - missing [specify]."
- "Bio contains unverifiable claims."

---

## 6. Dispute Resolution

### 6.1 Dispute Queue

```
┌─────────────────────────────────────────────────────────┐
│  Open Disputes (3)                                      │
│                                                         │
│  Filter: [All] [Trainer Issues] [Payment] [Other]      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ #127 - Trainer Not Responding                    │   │
│  │ Reported by: Mohamed Ali (Client)                │   │
│  │ Against: Ahmed Hassan (Trainer)                  │   │
│  │ Opened: 3 hours ago | Priority: High             │   │
│  │ [View Details]                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Dispute Detail View

```
┌─────────────────────────────────────────────────────────┐
│  Dispute #127                                           │
│                                                         │
│  Status: Open | Priority: High                          │
│  Opened: Jan 8, 2026, 10:30 AM                         │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Reporter: Mohamed Ali (Client)                         │
│  [View Profile] [View Chat History] [View Timeline]    │
│                                                         │
│  Against: Ahmed Hassan (Trainer)                        │
│  Trainer Type: Standard (20% commission)               │
│  [View Profile] [View All Clients]                     │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Reason: Trainer Not Responding                         │
│                                                         │
│  Client's Statement:                                    │
│  "I paid for weekly coaching 4 days ago but my         │
│  trainer hasn't responded to any of my messages."      │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Evidence:                                              │
│  [View Full Chat History]                              │
│  Last trainer message: 4 days ago                      │
│  Client messages since: 10 (unread)                    │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Payment Info:                                          │
│  Amount: EGP 1,500 (Weekly)                            │
│  Paid: Jan 4, 2026                                     │
│  Hold Status: In Hold (until Jan 11)                   │
│  Commission: EGP 300 (20%)                             │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Trainer Response: (Pending - 44 hours remaining)      │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Actions:                                               │
│                                                         │
│  [Issue Full Refund - EGP 1,500]                       │
│  [Issue Partial Refund: EGP ___]                       │
│  [Warn Trainer]                                        │
│  [Suspend Trainer (7 days)]                            │
│  [Ban Trainer Permanently]                             │
│  [Dismiss Dispute]                                     │
│                                                         │
│  Resolution Notes:                                      │
│  [Text area for admin notes]                           │
│                                                         │
│  [Submit Resolution]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Resolution Actions

| Action | Effect |
|--------|--------|
| **Full Refund** | Client refunded, trainer debited |
| **Partial Refund** | Prorated refund |
| **Warn Trainer** | Warning on record, notification sent |
| **Suspend Trainer** | Temporarily blocked (7/14/30 days) |
| **Ban Trainer** | Permanent removal |
| **Dismiss** | No action, dispute closed |

---

## 7. User Management

### 7.1 User Search

```
┌─────────────────────────────────────────────────────────┐
│  User Management                                        │
│                                                         │
│  Search: [________________________] [Search]            │
│                                                         │
│  Filters:                                               │
│  Type: [All] [Clients] [Trainers] [Partners]           │
│  Status: [All] [Active] [Suspended] [Banned]           │
│  Subscription: [All] [Free] [Trial] [Premium] [Prem+]  │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Results (showing 1-20 of 12,450)                      │
│                                                         │
│  [Photo] Mohamed Ali                                   │
│  Client | Premium+ | Active                            │
│  Joined: Dec 2025 | Last active: 2 hours ago           │
│  [View] [Suspend] [Ban] [Gift Premium]                 │
│                                                         │
│  [Photo] Ahmed Hassan ✓ 🌟Partner                      │
│  Trainer | 0% Commission | Active                      │
│  Joined: Nov 2025 | 12 clients                         │
│  [View] [Suspend] [Revoke Partner]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Trainer Detail View (Admin)

```
┌─────────────────────────────────────────────────────────┐
│  Trainer: Ahmed Hassan                                  │
│  Status: 🌟 Partner Trainer                            │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Commission: 0% (Partner)                              │
│  Partner since: Jan 1, 2026                            │
│  Granted by: Abdellatif                                │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  Stats:                                                 │
│  - Active clients: 12                                  │
│  - Total clients: 45                                   │
│  - Rating: 4.8 ⭐                                      │
│  - Total earnings: EGP 150,000                         │
│  - Premiums gifted: 8                                  │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  [Super Admin Actions]                                 │
│  [Revoke Partner Status]                               │
│  [Suspend] [Ban]                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Analytics Dashboard

### 8.1 User Metrics

```
┌─────────────────────────────────────────────────────────┐
│  User Analytics                                         │
│                                                         │
│  [Daily] [Weekly] [Monthly] [Custom Range]             │
│                                                         │
│  User Breakdown:                                        │
│  - Free users: 8,450                                   │
│  - Free trial: 400                                     │
│  - Premium: 1,200                                      │
│  - Premium+: 400                                       │
│  - Trainers (Standard): 150                            │
│  - Trainers (Partner): 6                               │
│                                                         │
│  Key Metrics:                                           │
│  - New signups this month: 1,245                       │
│  - Trial → Premium conversion: 35%                     │
│  - Premium → Premium+ upgrade: 12%                     │
│  - Trainer verification rate: 78%                      │
│  - 30-day retention: 42%                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Revenue Metrics

```
┌─────────────────────────────────────────────────────────┐
│  Revenue Analytics                                      │
│                                                         │
│  This Month: EGP 245,000                               │
│  vs Last Month: +18%                                   │
│                                                         │
│  Breakdown:                                             │
│  - Premium subscriptions: EGP 84,000 (34%)             │
│  - Premium+ subscriptions: EGP 42,000 (17%)            │
│  - Trainer commissions: EGP 119,000 (49%)              │
│                                                         │
│  Commission by Tier:                                    │
│  - 25% tier: EGP 45,000                                │
│  - 20% tier: EGP 52,000                                │
│  - 18% tier: EGP 18,000                                │
│  - 15% tier: EGP 4,000                                 │
│  - Partner (0%): EGP 0                                 │
│                                                         │
│  Partner Trainer Earnings (0% commission):              │
│  Total: EGP 85,000 (no revenue to platform)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Partner Trainer Stats

```
┌─────────────────────────────────────────────────────────┐
│  Partner Trainers (6)                                   │
│                                                         │
│  1. Ahmed Hassan                                       │
│     Partner since: Jan 1, 2026                         │
│     Earnings: EGP 45,000 | Clients: 12                 │
│     Premiums gifted: 5                                 │
│                                                         │
│  2. Sara Mohamed                                       │
│     Partner since: Dec 15, 2025                        │
│     Earnings: EGP 28,000 | Clients: 8                  │
│     Premiums gifted: 3                                 │
│                                                         │
│  [View All Partners]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Platform Settings

### 9.1 Business Settings

```
Commission Tiers:
  0-20 clients: [25]%
  21-50 clients (4.0+ rating): [20]%
  51-100 clients (4.3+ rating): [18]%
  100+ clients (4.5+ rating): [15]%

Premium Pricing:
  Monthly: EGP [99]
  Quarterly: EGP [249]
  Yearly: EGP [799]

Premium+ Pricing:
  Monthly: EGP [199]
  Quarterly: EGP [499]
  Yearly: EGP [1599]

Free Trial:
  Duration: [7] days
  Available to: [New users only]

Trainer Payout:
  Minimum withdrawal: EGP [100]
  Hold period: [7] days
```

### 9.2 Feature Toggles

```
☑ Enable trainer marketplace
☑ Enable chat
☑ Enable video sharing in chat
☑ Enable progress timeline
☑ Enable health app integration
☑ Enable free trial
☐ Enable social features (coming soon)
☐ Enable barcode scanner (coming soon)
```

---

## 10. Audit Log

All admin actions logged:

```
┌─────────────────────────────────────────────────────────┐
│  Audit Log                                              │
│                                                         │
│  Jan 9, 2026 15:00                                     │
│  [Super Admin: Abdellatif] Granted Partner status to   │
│  trainer: Ahmed Hassan                                 │
│  Reason: "Famous Instagram trainer, 100K followers"    │
│                                                         │
│  Jan 9, 2026 14:45                                     │
│  [Super Admin: Dodoelmahdy] Gifted 1 month Premium to  │
│  user: Mohamed Ali                                     │
│  Reason: "Early adopter reward"                        │
│                                                         │
│  Jan 9, 2026 14:32                                     │
│  [Admin: Sara] Approved trainer: Omar Khaled           │
│                                                         │
│  Jan 9, 2026 14:15                                     │
│  [Admin: Finance] Issued refund EGP 1,500 to           │
│  client: Ali Hassan (Dispute #127)                     │
│                                                         │
│  [Load more...]                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Logged actions include:
- Trainer verifications
- Partner status grants/revocations
- Premium gifts
- User suspensions/bans
- Refunds issued
- Disputes resolved
- Settings changes
- Admin account changes
