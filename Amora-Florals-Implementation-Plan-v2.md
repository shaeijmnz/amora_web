# Amora Florals — Implementation Plan v2
### (Updated with Detailed Owner/Admin Dashboard Spec)

> **This supersedes v1.** It keeps the same overall architecture (React+Tailwind web, React Native mobile, Supabase backend) but replaces the simplified owner-dashboard section with the full spec you provided, and calls out where scope now needs prioritization for your timeline.

---

## 1. What Changed from v1

| Area | v1 | v2 |
|---|---|---|
| Order status | 6 states | 9 states (adds Confirmed, Ready for Delivery, Completed, Refunded) |
| Delivery | A few fields on `orders` | Own `deliveries` table with a **separate** 9-state status machine, failed-attempt tracking |
| Custom requests | Just a flag on `order_items` | Full standalone entity with its own approval workflow, converts into an order |
| Stock status | available/out_of_stock/damaged | 6 states incl. Reserved, Spoiled (distinct from Damaged) |
| Reports | Not specified | Explicit report list — implemented as **views**, not new tables |
| Notifications | Flat list | Categorized (Inventory / Orders / Custom Requests / Deliveries / System) |
| Customers | Implicit via `profiles` | Dedicated list/profile screens + notes |

---

## 2. Full Updated Database Schema

### 2.1 Enums (Postgres `CREATE TYPE`)

```sql
stock_status:      in_stock, low_stock, out_of_stock, reserved, damaged, spoiled
order_status:      pending, confirmed, being_prepared, ready_for_delivery,
                   dispatched, delivered, completed, cancelled, refunded
delivery_status:   unscheduled, scheduled, assigned, preparing_for_dispatch,
                   dispatched, out_for_delivery, delivered, delivery_failed, rescheduled
payment_status:    unpaid, partially_paid, paid, refunded
request_status:    new, under_review, awaiting_customer_approval, approved,
                   in_preparation, completed, rejected, cancelled
notification_cat:  inventory, orders, custom_requests, deliveries, system
```

Two state machines exist on purpose: `order_status` is the overall business state; `delivery_status` is specifically the delivery leg. A DB trigger keeps them loosely in sync (e.g. `deliveries.status = 'delivered'` → sets `orders.status = 'delivered'`), but they aren't merged, matching how your spec separates "Order Management" from "Delivery Management."

### 2.2 Inventory (Section 2 of your spec)

| Table | Key Fields |
|---|---|
| `categories` | `id`, `name`, `group [flower\|material\|addon]` — free-text names so "Other flower types" / "Other add-ons" need no schema change |
| `inventory_items` | `id`, `name`, `category_id`, `image_url`, `unit`, `quantity_on_hand`, `min_stock_level`, `status (stock_status)`, `expiration_date`, `last_updated_at`, `archived_at`, `created_by` |
| `inventory_movements` | `id`, `item_id`, `movement_type [stock_in\|stock_out\|adjustment\|damaged\|spoiled\|reserved_release]`, `quantity_delta`, `previous_quantity`, `new_quantity`, `reason`, `reference_order_id`, `created_by`, `created_at` |

- **In Stock/Low Stock/Out of Stock** are computed automatically (quantity vs. `min_stock_level`) via a trigger on `inventory_items` update.
- **Reserved / Damaged / Spoiled** are manual overrides set through the corresponding admin action, which also writes an `inventory_movements` row — this is what powers the full audit trail in Section 8.
- **Archive item** = soft delete (`archived_at` timestamp), filtered out of default list queries instead of hard-deleted.

### 2.3 Products & Arrangements (Section 3)

| Table | Key Fields |
|---|---|
| `occasions` | `id`, `name` (Birthday, Anniversary, Wedding, Graduation, Valentine's Day, Mother's Day, Sympathy, Congratulations, Get Well Soon, Thank You, Other) |
| `products` | `id`, `name`, `description`, `primary_image_url`, `preparation_time_minutes`, `is_available`, `is_featured`, `archived_at`, `created_at` |
| `product_occasions` | `product_id`, `occasion_id` (many-to-many) |
| `product_images` | `id`, `product_id`, `url`, `sort_order` |
| `product_sizes` | `id`, `product_id`, `label`, `price` |
| `product_colors` | `id`, `product_id`, `color_name` |
| `product_required_materials` | `id`, `product_id`, `inventory_item_id`, `quantity_required` — powers "check material availability" |

- **"Number of orders"** on the product list = `count(order_items where product_id = X)`, computed at query time, not stored.
- **Duplicate arrangement** = app-level action (fetch + re-insert with a new id and "(Copy)" suffix); no schema change needed.
- Add-ons (chocolates, balloons, stuffed toys, gifts, cakes) are just `inventory_items` where `category.group = 'addon'` — **no separate add-ons table**, so stock for add-ons is tracked the same way as flowers/materials, and "Add-ons and Gifts" in Section 2 and "Add-ons" in Order details refer to the same rows.

### 2.4 Custom Arrangement Requests (Section 4 — standalone entity)

| Table | Key Fields |
|---|---|
| `custom_arrangement_requests` | `id`, `request_number`, `customer_id`, `reference_image_url`, `occasion_id`, `preferred_flowers`, `preferred_colors`, `bouquet_size`, `budget`, `personalized_message`, `requested_delivery_date`, `status (request_status)`, `estimated_price`, `admin_notes`, `converted_order_id`, `created_at`, `updated_at` |

- "Convert the request into an order" = an app action that inserts a row into `orders` + `order_items` (with `order_items.custom_request_id` pointing back here) and sets `converted_order_id`.

### 2.5 Orders (Section 5)

| Table | Key Fields |
|---|---|
| `orders` | `id`, `order_number`, `customer_id`, `order_type [standard\|custom]`, `status (order_status)`, `payment_status`, `payment_method`, `subtotal`, `addon_cost`, `customization_fee`, `delivery_fee`, `discount`, `total`, `recipient_name`, `recipient_contact`, `admin_notes`, `created_at`, `confirmed_at`, `completed_at`, `cancelled_at` |
| `order_items` | `id`, `order_id`, `product_id` (nullable if custom), `custom_request_id` (nullable), `size_id`, `quantity`, `unit_price`, `flower_color`, `personalized_message`, `reference_image_url` |
| `order_addons` | `id`, `order_item_id`, `inventory_item_id`, `quantity`, `unit_price` |
| `order_status_history` | `id`, `order_id`, `status`, `changed_by`, `changed_at`, `note` |

`recipient_name`/`recipient_contact` are separate from `customer_id` to support gifting (sender ≠ recipient) — matches your Order Details "Delivery Information: Recipient name / Recipient contact number."

### 2.6 Delivery (Section 6)

| Table | Key Fields |
|---|---|
| `deliveries` | `id`, `order_id` (unique FK), `status (delivery_status)`, `scheduled_date`, `scheduled_time`, `delivery_fee`, `assigned_rider_id`, `delivery_address_id`, `delivery_instructions`, `proof_of_delivery_url`, `created_at`, `updated_at` |
| `delivery_attempts` | `id`, `delivery_id`, `attempt_number`, `status`, `failed_reason`, `attempted_at`, `attempted_by` |

Keeping `delivery_attempts` separate from `deliveries` lets you show full history for **Failed Delivery Attempts** and **Rescheduled** without overwriting prior attempt data.

### 2.7 Customers (Section 7)

| Table | Key Fields |
|---|---|
| `profiles` | (from v1) + `account_status [active\|inactive\|blocked]` |
| `addresses` | (from v1, unchanged) |
| `customer_notes` | `id`, `customer_id`, `note`, `created_by`, `created_at` |

"Number of orders," "total amount spent," "last order date" are computed via a view (`v_customer_summary`), not stored — avoids drift.

### 2.8 Reports (Section 8) — implemented as **views**, not tables

| View | Powers |
|---|---|
| `v_current_stock`, `v_low_stock`, `v_out_of_stock`, `v_damaged_stock`, `v_spoiled_flowers` | Inventory reports |
| `v_material_usage` | Material usage report (sums `order_addons` + `product_required_materials` against `inventory_movements`) |
| `v_sales_daily` / `v_sales_weekly` / `v_sales_monthly` | Sales reports (one parametrized query, grouped by date_trunc) |
| `v_best_selling_arrangements`, `v_most_requested_flower_types`, `v_most_popular_occasions` | Sales insight reports |
| `v_cancelled_orders`, `v_custom_arrangement_sales` | Order reports |
| `v_delivery_performance`, `v_orders_per_delivery_person`, `v_completed_deliveries`, `v_failed_deliveries` | Delivery reports |

Reports as views means zero extra write-path code and no risk of stale aggregates — they're always computed live from the same tables the rest of the app writes to. `inventory_movements` (2.2) already has every field your **Inventory Movement History** list needs (date/time, item, transaction type, quantity added/removed, previous/new quantity, reason, order reference, admin responsible).

### 2.9 Notifications (categorized)

| Table | Key Fields |
|---|---|
| `notifications` | `id`, `user_id`, `category (notification_cat)`, `title`, `body`, `related_type`, `related_id`, `is_read`, `created_at` |

Generated by:
- **Inventory** — scheduled function checks `quantity_on_hand < min_stock_level` (low/out of stock) and `expiration_date` within N days (nearing spoilage)
- **Orders** — trigger on `orders` insert (new order) / status → cancelled
- **Custom Requests** — trigger on `custom_arrangement_requests` insert
- **Deliveries** — trigger on `deliveries` insert with no `assigned_rider_id` (unassigned), scheduled function for "upcoming" (within X hours), trigger on `delivery_attempts` failed status, trigger on customer "Confirm Received" action
- **System** — manual/app-level (e.g. account issues)

---

## 3. Owner/Admin Web Dashboard — Page-by-Page

### 3.1 Dashboard (Section 1)
- Implement as **one Postgres RPC function** `get_dashboard_summary()` returning all summary-card counts (Total Products, Available Flowers, Low-Stock, Out-of-Stock, Damaged/Spoiled, New Orders, Being Prepared, For Delivery, Completed, Today's Sales) in a single round trip — avoids 10 separate queries on every page load.
- Widgets (Recent Orders, Today's Deliveries, Low-Stock Alerts, Best-Selling Arrangements, Recent Inventory Activity, Sales Overview chart) reuse the report views from §2.8.
- Quick Actions are pure navigation shortcuts (Add Product, Add Flower Stock, Record Damaged Stock, Create Customer Order, Assign Delivery, View Low-Stock Items) — no new backend.

### 3.2 Inventory Management (Section 2)
Screens: Inventory list (filters: search, category, stock status, flower type, freshness/expiration; sort: quantity, date updated) → Item detail/edit → Add Stock / Deduct Stock / Adjust Quantity modals (each writes to `inventory_movements`) → Mark Out of Stock/Available/Damaged/Spoiled → Archive.

### 3.3 Product & Arrangement Management (Section 3)
Screens: Product list (filter/sort as listed) → Product form (name, description, images, occasion(s), flower types, colors, sizes+price, required materials, prep time, availability, featured toggle) → Duplicate/Archive/Feature actions.

### 3.4 Custom Arrangement Requests (Section 4)
Screens: Request list (filter by status) → Request detail (reference image viewer, customer instructions, estimated price field, material availability check against §2.3 `product_required_materials`/inventory, alternative-flower suggestion notes, approve/reject, convert-to-order button).

### 3.5 Order Management (Section 5)
Screens: Order list (filters by status/payment status/date) → Order detail with the 4 sub-panels you specified (Customer Info / Product Info / Payment Info / Delivery Info) → Actions (confirm, cancel, update payment/order status, print summary, assign delivery person, contact customer, admin notes).

### 3.6 Delivery Management (Section 6)
Screens: Delivery dashboard (today's scheduled / unassigned / in-progress / completed / failed / upcoming — all filtered views over `deliveries`) → Delivery detail (schedule, fee, assign rider, notes, status update, proof-of-delivery viewer, failed-reason entry).

### 3.7 Customers (Section 7)
Screens: Customer list (`v_customer_summary`) → Customer profile (info, saved addresses, order history, custom requests, cancelled orders, notes).

### 3.8 Reports & History (Section 8)
Screens: Tabbed report viewer (Inventory / Sales / Delivery / Movement History) rendering the views from §2.8, each with a date-range filter and CSV export button (straightforward with Supabase + `papaparse` on the client).

### 3.9 Notifications
Bell icon in top nav, dropdown grouped by category, backed by a Realtime subscription on `notifications` filtered by `user_id`, with category tabs/filter.

---

## 4. Mobile App (Customer + Rider) — Updated for New Statuses

- **Customer tracking screen:** don't expose all 9 raw `order_status` values — map them to simpler customer-facing labels:

  | Internal status | Customer sees |
  |---|---|
  | pending, confirmed | "Order Received" |
  | being_prepared | "Preparing your order" |
  | ready_for_delivery, dispatched, out_for_delivery | "On the way" |
  | delivered, completed | "Delivered" |
  | cancelled, refunded | "Cancelled" |

  This keeps the admin's granular workflow intact without confusing the customer with internal-ops terminology.

- **Rider app:** "My Deliveries" now reflects the full `delivery_status` machine (Assigned → Preparing for Dispatch → Dispatched → Out for Delivery → Delivered), plus a **Delivery Failed** button that prompts for a reason (writes to `delivery_attempts`) and a **Reschedule** flow.

- Custom arrangement request submission (reference image + preferences) can live in the customer mobile app too, feeding directly into `custom_arrangement_requests` — same table the admin dashboard reviews.

---

## 5. Scope Check: MVP vs. Phase 2

This spec is comprehensive — building all of it well in a July–October student timeline is tight. Recommend explicitly agreeing with the client on:

**MVP (build first, matches original Part IV problems):**
- Inventory Management (full, since it's their #1 stated pain point)
- Product/Arrangement Management (core CRUD, skip "featured" polish initially)
- Order Management (core flow, skip refunds/print-summary initially)
- Delivery Management (core assign/status update, skip failed-attempt/reschedule history initially)
- Basic Dashboard (summary cards only, skip charts)
- Notifications (orders + inventory categories only)

**Phase 2 (valuable, but defer if time-constrained):**
- Custom Arrangement Requests as a full standalone approval workflow (can start as a simple form + admin notes, add multi-stage status later)
- Full Reports & History tab (build the views early since they're cheap, but the polished report *UI* can wait)
- Customer notes / account status management
- Delivery failed-attempt tracking & rescheduling
- Best-selling/analytics widgets

Suggest walking through this split with the client (or your instructor) before locking August/September sprint targets from v1's timeline — the delivery and custom-request workflows in particular add real backend complexity beyond what v1's simpler order flow assumed.

---

## 6. Next Steps

1. Confirm the MVP vs. Phase 2 split above with your team/client.
2. Update the Supabase migrations from v1 to the schema in §2 (this is additive/restructuring, not a rewrite — most v1 tables just gain fields or split into two).
3. Build `get_dashboard_summary()` and the report views early — they're cheap and will make every later screen (dashboard, reports) trivial to wire up.
4. Prioritize the Custom Arrangement Requests table structurally now even if the full review UI is Phase 2 — it's the one new entity that touches both customer mobile and admin web.
