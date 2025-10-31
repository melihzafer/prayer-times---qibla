# 🚀 Prayer Times & Qibla — Feature Roadmap & New Features

**Last Updated**: October 31, 2025  
**Status**: MVP Ready + Expansions Planned

---

## 📊 Feature Priority Matrix

| Priority | Feature | Effort | Impact | Status |
|----------|---------|--------|--------|--------|
| **P0** | ✅ Geolocation + Prayer Times | Low | Very High | ✅ Shipped |
| **P0** | ✅ Qibla Compass | Low | Very High | ✅ Shipped |
| **P0** | ✅ Multi-Language (EN/TR/AR) | Low | High | ✅ Shipped |
| **P1** | 🆕 **Share Prayer Times** | Low | High | Proposed |
| **P1** | 🆕 **Prayer Streaks & Stats** | Medium | Medium | Proposed |
| **P1** | 🆕 **Sound Notifications** | Low | High | Proposed |
| **P2** | 🆕 **Multi-City Bookmarks** | Low | Medium | Proposed |
| **P2** | 🆕 **Prayer Reminders (SMS/Email)** | Medium | High | Future |
| **P2** | 🆕 **Islamic Calendar Events** | Medium | Medium | Partial (Asma/Hadith) |
| **P3** | 🆕 **Community Features** | High | Medium | Future |

---

## 🎯 High-Value New Features (Next Quarter)

### 1️⃣ **Share Prayer Times** ⚡ [Easy | High Impact]

**What**: One-tap sharing of prayer times to WhatsApp, Twitter, SMS, email, or clipboard.

**Why**: Users want to notify family/friends of prayer times; social proof.

**Spec**:
```
Share button → modal with options:
  - Copy to clipboard: "Zuhr at 12:30 PM in New York 🕌"
  - Share to WhatsApp: Deeplink with pre-filled message
  - Share to Twitter: "I'm following prayer times in NYC 🕌 #PrayerTimes"
  - Email: Send as calendar invite (iCal format)
  - QR Code: Shareable link to app with pre-filled city
```

**Files**: New `components/ShareModal.tsx`, update `App.tsx`

**Estimated Effort**: 2 hours

**Success Metric**: 5%+ daily shares within 2 weeks of launch

---

### 2️⃣ **Prayer Streaks & Statistics** 📊 [Medium | Medium Impact]

**What**: Track user's prayer consistency—"You've prayed on time X days in a row" + monthly stats.

**Why**: Gamification → habit formation → retained users.

**Spec**:
```
Dashboard Widget:
┌─────────────────────┐
│  🔥 7-Day Streak    │
│  Current Prayers:   │
│  Fajr:    ✅ 100%   │
│  Dhuhr:   ✅ 95%    │
│  Asr:     ⚠️  80%   │
│  Maghrib: ✅ 100%   │
│  Isha:    ✅ 92%    │
│                     │
│  📈 Oct Stats:      │
│  Total Prayers: 142 │
│  On Time:  89%      │
└─────────────────────┘
```

**Data Model**:
```typescript
interface PrayerStreak {
  userId: string; // localStorage-based
  prayerName: string;
  lastPrayedDate: Date;
  streak: number;
  allTimeTotal: number;
  monthlyStats: { [month: string]: number };
}
```

**Files**: New `components/PrayerStats.tsx`, new hook `usePrayerStats.ts`, localStorage schema

**Estimated Effort**: 4 hours

**Success Metric**: Users open app 2x/week to check streak

---

### 3️⃣ **Sound Notifications** 🔔 [Low | High Impact]

**What**: Audible alert when prayer time arrives (Azan audio).

**Why**: Users miss silent notifications; audible alarm ensures engagement.

**Spec**:
```
Settings toggle: "Enable Sound Notifications"
  - Play Azan on prayer time (use free Azan API)
  - Volume slider (0–100%)
  - Snooze 5/10/15 mins
  - Mute during "Do Not Disturb" (honors device settings)

Audio source: https://www.aladhan.com/azan (free Azan audio)
or locally host MP3 files for reliability.
```

**Files**: New `services/audio.ts`, new `components/NotificationAudio.tsx`, update `usePrayerData.ts`

**Estimated Effort**: 2 hours

**Success Metric**: 30%+ notification open rate (vs current silent 10%)

---

### 4️⃣ **Multi-City Bookmarks** 🏙️ [Low | Medium Impact]

**What**: Save favorite cities (home, work, vacation spot); quick-switch dropdown.

**Why**: Travelers and diaspora users check prayer times in multiple cities.

**Spec**:
```
Header Dropdown:
┌──────────────────────┐
│ 📍 New York (Current)│
│ 📍 Istanbul          │
│ 📍 Cairo             │
│ ➕ Add City          │
└──────────────────────┘

Save up to 5 cities; fastest load on click.
Store in localStorage:
{
  "bookmarkedCities": [
    { name: "New York", lat: 40.71, lon: -74.00 },
    { name: "Istanbul", lat: 41.01, lon: 28.97 }
  ]
}
```

**Files**: New `components/CityBookmarks.tsx`, update `usePrayerData.ts`

**Estimated Effort**: 3 hours

**Success Metric**: 15%+ users with >1 bookmarked city

---

### 5️⃣ **Export to Calendar** 📅 [Medium | Medium Impact]

**What**: Generate iCal (`.ics`) file for all 5 prayers; import into Google Calendar, Outlook, etc.

**Why**: Integrates prayer times into user's existing calendar workflow.

**Spec**:
```
Button: "Export to Calendar"
  ↓
Generates `.ics` file with 5 recurring events:
  EVENT:Fajr
  DTSTART:06:00
  DTEND:06:15
  RRULE:FREQ=DAILY (or one-time for specific date)
  DESCRIPTION:Fajr Prayer
```

**Files**: New `utils/calendar.ts`, new `components/CalendarExport.tsx`

**Estimated Effort**: 3 hours

**Success Metric**: 500+ downloads in first month

---

### 6️⃣ **Offline Support (Service Worker)** 🔌 [Medium | High Impact]

**What**: Full offline functionality—cache prayer times, work without network.

**Why**: Prayer times don't change hourly; offline = reliable experience.

**Spec**:
```
- Cache prayer data for 7 days per city
- Auto-sync when online
- Show "Offline" badge; offer last-known data
- Background sync for prayer notifications
```

**Files**: New `public/service-worker.js`, update `vite.config.ts` for PWA plugin

**Estimated Effort**: 4 hours

**Success Metric**: 100% uptime, <50ms load time

---

### 7️⃣ **Prayer Reminder (Email/SMS Backend)** 📧 [High Effort | High Impact]

**What**: Optional daily prayer reminder email or SMS (not yet shipped; requires backend).

**Why**: Re-engagement for lapsed users.

**Spec**:
```
Backend endpoint: POST /api/reminders/subscribe
  {
    "userId": "...",
    "email": "user@example.com",
    "method": "email|sms",
    "prayers": ["Fajr", "Dhuhr", "Asr"],
    "time": "00:10" // 10 mins before
  }

Requires: Sendgrid/Twilio backend integration (out of scope for MVP)
```

**Files**: Not implemented yet (backend required)

**Estimated Effort**: 8 hours (backend) + 2 hours (frontend)

**Success Metric**: 10%+ opt-in rate

---

## 🎨 Design System & UI/UX Improvements

### Current State (Good)
- ✅ Clean, minimal design
- ✅ Dark mode support
- ✅ RTL-ready (Arabic)
- ✅ Responsive mobile-first

### Gaps to Fill
- ❌ No loading skeletons (layout shift)
- ❌ No empty states (when location not set)
- ❌ No error recovery UI
- ❌ Limited accessibility (ARIA labels, focus management)
- ❌ Notification toast too subtle
- ❌ No gesture support (swipe between days)

### Recommendations

#### A. Loading Skeletons
```tsx
// Before real data loads
<div className="animate-pulse space-y-3">
  <div className="h-12 bg-gray-300 rounded"></div>
  <div className="h-24 bg-gray-300 rounded"></div>
</div>
```

#### B. Empty State (No Location)
```
┌──────────────────────────┐
│       📍 Welcome!        │
│                          │
│  "Enable location or     │
│   search a city to       │
│   get started."          │
│                          │
│  [📍 Use My Location]    │
│  [🔍 Search City]        │
└──────────────────────────┘
```

#### C. Enhanced Notifications
- Toast appears at top with bell icon + prayer name + time
- Auto-dismiss after 10s or on click
- Add "Snooze 5 min" button
- Subtle sound + haptic feedback

#### D. Accessibility (a11y)
- Add `aria-label` to all interactive elements
- Ensure color contrast ≥ 4.5:1 (WCAG AA)
- Keyboard navigation (Tab, Enter, Arrow keys)
- Focus ring on all buttons
- Screen reader support for "next prayer" countdown

#### E. Swipe Gestures (Mobile)
- Swipe left → next day
- Swipe right → previous day
- Implement with `react-gesture` or pointer events

---

## 🔄 Proposed Product Roadmap

### **Phase 1: Stability** (Now)
- ✅ Bug fixes (#1–5)
- ✅ Test infrastructure
- ✅ Performance optimization
- ✅ Security audit (.env, API keys)

### **Phase 2: Engagement** (Weeks 2–3)
- 🆕 Share Prayer Times
- 🆕 Prayer Streaks & Stats
- 🆕 Sound Notifications
- 🎨 Loading skeletons + empty states

### **Phase 3: Expansion** (Weeks 4–5)
- 🆕 Multi-City Bookmarks
- 🆕 Calendar Export
- 🔌 Offline Service Worker
- 🎨 Accessibility polish

### **Phase 4: Monetization** (Month 2)
- 🆕 Premium features (SMS reminders, advanced stats)
- 🆕 Community features (group prayer tracking)
- 📱 Native iOS/Android apps (React Native)

---

## 📈 Success Metrics

| KPI | Target | Current | Timeline |
|-----|--------|---------|----------|
| MAU (Monthly Active Users) | 10K | 0 | 3 months |
| Share Rate | 5% | - | Week 2 |
| Prayer Streak Adoption | 20% | - | Week 3 |
| Offline Usage | 30% | - | Week 4 |
| Retention (Day 7) | 40% | - | Month 1 |
| Retention (Day 30) | 25% | - | Month 2 |
| Avg. Daily Prayer Tracked | 3.5 | - | Month 2 |

---

## 🛠️ Implementation Checklist

### Week 1 (Now)
- [ ] Deploy bug fixes
- [ ] Launch tests in CI/CD
- [ ] Performance baseline

### Week 2
- [ ] Ship Share Modal
- [ ] Add Prayer Stats component
- [ ] Sound notifications integration

### Week 3
- [ ] Multi-City Bookmarks
- [ ] Calendar Export
- [ ] A/B test notification engagement

### Week 4
- [ ] Service Worker + offline
- [ ] Accessibility audit
- [ ] User feedback collection

---

## 💡 Nice-to-Have (Backlog)

1. **Islamic Education**: Daily Quranic verse with tafsir
2. **Prayer Companions**: Find nearby users praying at same time (privacy-respecting)
3. **Charity Integration**: Link prayer streaks to donate
4. **Mosque Directory**: Search mosques, read reviews, book spaces
5. **Family Sharing**: Shared family prayer dashboard
6. **Apple Watch/Wear OS**: Native companion app
7. **AR Qibla**: AR compass overlay on camera
8. **Prayer Analytics Dashboard**: Monthly/yearly insights

---

## 🤝 Community Feedback Channels

- **In-app Survey**: "How can we improve?"
- **Discord Community**: Gather feature requests
- **User Testing**: Schedule 1:1 interviews (5 users/week)
- **GitHub Discussions**: Public roadmap transparency

---

**Next Step**: Prioritize Phase 2 features; schedule design review & development kickoff.

