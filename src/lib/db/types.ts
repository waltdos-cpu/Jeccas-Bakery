import type {
  CustomRequest,
  NewOrder,
  Order,
  OrderStatus,
  Product,
  RequestStatus,
  Settings,
  Subscriber,
} from "../types";

export type PlaceOrderResult = { ok: true; id: string } | { ok: false; error: "full" };

export type ProductPatch = Partial<Omit<Product, "id">>;

export interface Repo {
  getProducts(): Promise<Product[]>;
  updateProduct(id: string, patch: ProductPatch): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  /** Non-cancelled orders per bake date. */
  countOrdersByDate(dates: string[]): Promise<Record<string, number>>;
  /** Atomically checks the day's capacity and inserts the order. */
  placeOrder(order: NewOrder): Promise<PlaceOrderResult>;
  getOrder(id: string): Promise<Order | null>;
  listOrders(range: { from: string; to: string }): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;

  createRequest(r: Omit<CustomRequest, "id" | "created_at" | "status">): Promise<void>;
  listRequests(): Promise<CustomRequest[]>;
  updateRequestStatus(id: string, status: RequestStatus): Promise<void>;

  addSubscriber(contact: string, lang: Subscriber["lang"]): Promise<void>;
  listSubscribers(): Promise<Subscriber[]>;
}

export class DuplicateCodeError extends Error {}
