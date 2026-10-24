export type Lang = "en" | "es";

export type Flavor = { id: string; en: string; es: string };

export type Product = {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  /** Price for one pack (a pack of 1 for single items). */
  price_cents: number;
  pack_size: number;
  /** When non-empty, the customer picks a flavor for every piece in a pack. */
  flavors: Flavor[];
  image: string;
  sort: number;
  active: boolean;
  sold_out: boolean;
};

export type Settings = {
  /** 0 = Sunday … 6 = Saturday */
  bakeWeekdays: number[];
  /** Orders close this many hours before the bake day starts (midnight). */
  cutoffHours: number;
  /** How many days ahead customers can book. */
  daysAhead: number;
  /** e.g. "10:00-12:00" */
  pickupWindows: string[];
  maxOrdersPerDay: number;
  /** YYYY-MM-DD dates that are closed even on a bake weekday. */
  blackoutDates: string[];
  /** YYYY-MM-DD one-off bake days outside the usual weekdays. */
  extraDates: string[];
  pickupArea: string;
  /** Only shown to a customer after they place an order. */
  pickupAddress: string;
  paymentNote: string;
  paymentNoteEs: string;
  ownerEmail: string;
  announcement: string;
  announcementEs: string;
};

/** A cart line as the browser sends it. Prices are never trusted from the client. */
export type CartLine = {
  productId: string;
  packs: number;
  /** flavor id -> pieces, summing to the product's pack_size */
  flavors?: Record<string, number>;
};

export type OrderStatus = "new" | "confirmed" | "ready" | "picked_up" | "cancelled";

export type OrderItem = {
  product_id: string;
  name: string;
  packs: number;
  pack_size: number;
  flavors: Record<string, number> | null;
  unit_price_cents: number;
  line_total_cents: number;
};

export type Order = {
  id: string;
  code: string;
  created_at: string;
  status: OrderStatus;
  bake_date: string;
  pickup_window: string;
  customer_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  subtotal_cents: number;
  lang: Lang;
  items: OrderItem[];
};

export type NewOrder = Omit<Order, "id" | "created_at" | "status">;

export type RequestStatus = "new" | "quoted" | "done" | "declined";

export type CustomRequest = {
  id: string;
  created_at: string;
  status: RequestStatus;
  name: string;
  phone: string;
  email: string | null;
  event_date: string | null;
  quantity: string | null;
  details: string;
  lang: Lang;
};

export type Subscriber = { id: string; created_at: string; contact: string; lang: Lang };
