# Advanced Home Care — Admin Panel

React + Tailwind CSS + lucide-react. Manages everything on the website through
the backend API (`../backend`), with JWT login.

## Run

```bash
npm install
npm run dev        # http://localhost:5174
```

Start the backend first (`cd ../backend && npm run dev`) and the website
(`cd ../advancedhomecare && npm run dev`, http://localhost:5173).

`.env`:

```
VITE_API_URL=http://localhost:5000        # backend
VITE_WEBSITE_URL=http://localhost:5173    # for "View website" links
```

The admin panel's address must be in the backend's `CORS_ORIGINS` (5174 is already there).

Default login: `admin@advancedhomecare.in` / `Admin@12345`. Change it in **My Account**.

## What you can manage

| Menu | Controls on the website |
| --- | --- |
| Dashboard | Enquiry counts, recent enquiries |
| Enquiries / Customers / Enquiry Statuses | Website form submissions, follow-up status and notes |
| Page Sections | Every heading, paragraph, photo and button on every page, plus their lists (trust points, stats, Why Choose Us cards incl. the 24×7 card, steps, checklists, values) |
| Services / Service Categories | Service cards, service detail pages, enquiry-form service list |
| Care Durations | Duration cards and booking-form options |
| FAQs / FAQ Categories | Homepage, How It Works and FAQ page |
| Testimonials, Team | Slider and team cards |
| Navbar & Footer | Header links, header button, footer columns and headings |
| Legal Pages | Privacy Policy, Terms & Conditions |
| Media Library | All photos. Upload new ones; old photos stay until you delete them; photos in use can't be deleted |
| Site Settings | Logo, name, phone, WhatsApp, email, address, hours, Google Map, footer text, social links |
| Admin Users | Add editors or super admins (super admin only) |

Changes are live as soon as they are saved — refresh the website to see them.

## Structure

```
src/
  lib/            api client (JWT), formatters, section labels, icon map
  context/        auth + toast providers
  hooks/          useApiGet, media/icon caches
  components/     Layout, ui kit, inputs (image/icon pickers), FormFields, ResourcePage (generic CRUD)
  pages/          Dashboard, Enquiries, Customers, Sections, SectionEditor, Navigation,
                  Media, Settings, Legal, Account, resources.jsx (services, FAQs, team, …)
```
