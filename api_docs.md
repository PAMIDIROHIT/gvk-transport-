# GVK Transport Management API v2.0 (Postman Guide)

This document details the production-ready REST API endpoints for the GVK Transport Management System. Use these details to configure your Postman collections.

## Base URL
`http://localhost:5000/api/v1`

---

## 1. Lorry & Fleet Management

### [GET] /lorry
- **Description**: List all lorries (Own/Rented).
- **Params**: `search` (Search by number/owner), `page`, `limit`.

### [POST] /lorry/private
- **Description**: Log a new rented lorry payout.
- **Payload**:
```json
{
  "vendor_name": "Sree Rama Logistics",
  "lorry_number": "AP 12 XY 3456",
  "tonnes_loaded": 25.5,
  "freight_rate_per_ton": 850,
  "cash_advances": 5000,
  "diesel_advances": 10000,
  "tds_percentage": 1.0,
  "amount_paid": 0
}
```

---

## 2. Factory Sales

### [GET] /factory/sales
- **Description**: Retrieve sales data with advanced filters.
- **Params**: `factory_name`, `start_date`, `end_date`, `page`.

---

## 3. Procurement (Mines)

### [POST] /mine
- **Description**: Log new material extraction.
- **Payload**:
```json
{
    "mine_name": "Balaji Mines",
    "material_name": "Iron Ore",
    "tonnes": 50,
    "cost_per_ton": 1200,
    "gst_percentage": 18
}
```
---
*Generated for GVK Transport Professional Accounting*
