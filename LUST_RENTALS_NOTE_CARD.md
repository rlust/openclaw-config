# 🏠 Lust Rentals App - Quick Reference Card

## App URL
**Production:** http://100.78.223.120:8000  
**Local Dev:** http://localhost:8000  
**API Docs:** http://100.78.223.120:8000/docs  

---

## 📋 Quick Start

### Access the App
1. Open browser → **http://100.78.223.120:8000**
2. Main dashboard shows annual summaries
3. Click on property to see detailed reports

### Main Features
- **Dashboard:** Annual summaries by property
- **Schedule E Reports:** IRS Form Schedule E auto-generation
- **Property Management:** Add/edit properties and rental info
- **Data Management:** Upload/export CSV files
- **Reporting:** Generate accountant-ready reports

---

## 🚀 Common Tasks

### Add a New Property
1. Go to Dashboard → **Properties**
2. Click **+ Add Property**
3. Enter:
   - Property address
   - Acquisition date
   - Type (single-family, multi-unit, etc.)
4. Save → Property now ready for income/expense entry

### Enter Monthly Income/Expenses
1. Select property from dashboard
2. Click **+ Add Entry**
3. Fill in:
   - Month/Year
   - Category (rent, mortgage, repairs, utilities, etc.)
   - Amount
   - Optional: Notes/attachments
4. Save

### Generate Schedule E Report
1. Dashboard → **Generate Reports**
2. Select year + property
3. Click **Schedule E** → PDF downloads automatically
4. Review before sending to accountant

### Export Data
1. Dashboard → **Data Management**
2. Click **Export** → Choose format:
   - CSV (spreadsheet)
   - JSON (data backup)
   - Excel (pivot tables)
3. Download file

---

## 🔄 Monitoring Status
**Cron Job:** Hourly app health check via `Lust Rentals App Monitor`  
**Alert:** If app goes down, you'll receive Telegram notification in HAL Group

---

## 📊 Analysis & Recommendations (Pending Review)

Three enhancement options ranked by ROI:

### 1️⃣ **RECOMMENDED: Depreciation Module + Schedule E Completion** (HIGH ROI)
- Captures $5k-$50k in deductions
- Complete Schedule E (lines 1-28, not just 1-12)
- Split mortgage into principal/interest
- Timeline: 2-3 weeks
- Cost: $8k-$15k
- **Status:** Awaiting your approval → Implement Week 1

### 2️⃣ Data Quality Dashboard + Fuzzy Matching (EFFICIENCY)
- 50-70% time savings on data entry
- Auto-correct common entries
- Detect duplicates
- Timeline: 2 weeks
- Cost: $5k-$8k

### 3️⃣ Consolidated LLC Dashboard (STRATEGIC)
- Multi-property aggregate view
- Performance benchmarking
- Entity-level reporting
- Timeline: 2 weeks
- Cost: $6k-$10k

**Full Analysis:** See `LUST_RENTALS_REPORTING_ANALYSIS.md`

---

## 🛠️ Troubleshooting

### App Won't Load
```bash
# Check if service is running
curl -s -I http://100.78.223.120:8000 | head -1

# If not running, restart via cron alert or manual:
# (Check HAL's alert in Telegram)
```

### Lost Data?
- All data backed up hourly
- Restore available via admin panel
- Contact HAL if data needs recovery

### Need to Add Custom Category?
1. Go to **Settings → Categories**
2. Click **+ Add Category**
3. Enter name + type (income/expense)
4. Save → Available immediately in data entry

---

## 📁 Files & Documentation

| File | Purpose |
|------|---------|
| `LUST_RENTALS_REPORTING_ANALYSIS.md` | Full analysis of 3 recommendation options |
| `PRODUCTION_QUICKSTART.md` | Deployment instructions |
| `ENHANCED_REVIEW_GUIDE.md` | Advanced reporting features |
| `PROPERTY_MANAGEMENT_FEATURE.md` | Property management deep-dive |

---

## 💬 Contact & Support
Questions or issues? Alert HAL in Telegram → HAL Group → General/Lobby  
Cron monitors hourly; downtime alerts automatic.

---

**Last Updated:** Feb 8, 2026  
**Status:** Active | Health: ✅ Monitored hourly
