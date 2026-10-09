# PrintFlow

**A cloud-based print ordering platform that lets customers upload documents, choose a print shop and print options, place an order, and collect using a pickup code without waiting in line.**

## Problem

Print shops can become congested during school, work, application, and other deadline periods. Customers lose time waiting in line, while shops handle walk-in requests in arrival order.

## Solution

PrintFlow lets a customer select a document, choose a print shop, configure print options, and place an order before arriving. The customer receives an order number and pickup code to present when collecting the completed prints.

## Key Features

- Customer order flow with document selection, shop choice, copies, colour mode, print sides, paper size, price estimate, and pickup code.
- Supabase/PostgreSQL persistence for shops and customer orders.
- Private document uploads to the `print-files` Supabase Storage bucket when an order is placed.
- Shop dashboard at `/shop` with incoming orders, order details, search, status filtering, and status management.
- Responsive landing page, customer workflow, and shop dashboard.
- No authentication, payment processing, or QR code generation is implemented.

## Tech Stack

- React
- TypeScript
- Vite
- Supabase JavaScript client
- PostgreSQL (through Supabase)
- Supabase Storage (private `print-files` bucket)
- Git and GitHub
- Vercel (deployment target; deployment configuration is not included yet)

## Application Workflow

### Customer

1. Select a local document. It remains in browser state until the order is placed.
2. Choose a shop loaded from the Supabase `shops` table.
3. Set copies, colour or black and white, single- or double-sided printing, and A4 or A3 paper.
4. Review the estimated price and place the order. PrintFlow uploads the document to private storage, saves its path and the order details, and generates an order number and pickup code. If upload fails, no order row is created.
5. Show the pickup code at the selected shop when collecting the order.

### Print shop

1. Open `/shop` to view orders loaded from Supabase.
2. Search by order number or filename, or filter by order status.
3. Update an order through Received, Printing, Ready, and Collected. Status changes are saved to Supabase.

## Architecture

The React frontend runs in the browser and uses `@supabase/supabase-js` with the Vite environment variables to query Supabase. PostgreSQL stores shop and order records; SQL migrations define the schema, seed demo shops, and configure Row Level Security policies. The app has no separate application backend. When an order is submitted, the frontend uploads its document to the private Supabase Storage bucket and stores the resulting path in the order row.

The current MVP policies allow anonymous shop reads, order creation, order reads, and status-only updates. Add authentication and shop-level access rules before using the dashboard with private or production order data.

## Project Structure

```text
.
├── public/                         # Static public assets
├── src/
│   ├── lib/supabase.ts             # Supabase client configuration
│   ├── App.tsx                     # Landing page and route selection
│   ├── OrderFlow.tsx               # Customer order workflow
│   ├── OrderFlow.css               # Customer workflow styles
│   ├── ShopDashboard.tsx           # Shop order dashboard
│   ├── ShopDashboard.css           # Dashboard styles
│   ├── index.css                   # Global styles
│   └── main.tsx                    # React application entry point
├── supabase/migrations/            # PostgreSQL schema, seed data, and RLS policies
├── .env.example                    # Supabase environment variable template
├── index.html                      # Vite HTML entry point
├── package.json                    # Scripts and dependencies
└── vite.config.ts                  # Vite configuration
```



## Author

Muslima Nadia Ofori
