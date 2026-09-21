export type ProductStatus = "ACTIVE" | "DRAFT";

export type ProductImage = {
  key: string;
  url: string;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
  quantity: number;
  supplierId?: string | null;
  lowStockThreshold?: number;
  images?: ProductImage[];
  /** Legacy field retained while existing MongoDB products are migrated. */
  image?: ProductImage | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt"
>;

export function getProductImages(product: Product): ProductImage[] {
  if (product.images?.length) return product.images.slice(0, 4);
  return product.image ? [product.image] : [];
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";
export type InvoiceLineType = "PRODUCT" | "SERVICE";

export type InvoiceItem = {
  productId: string | null;
  type?: InvoiceLineType;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string | null;
  items: InvoiceItem[];
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  createdAt?: string;
};

export type CreateInvoiceInput = {
  customerId?: string | null;
  customerName: string;
  customerEmail: string | null;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  items: Array<{
    type: InvoiceLineType;
    productId?: string | null;
    name?: string;
    unitPrice?: number;
    quantity: number;
  }>;
  status?: InvoiceStatus;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactInput = Omit<Contact, "id" | "createdAt" | "updatedAt">;

function contactApi(path: string) {
  return {
    list: () => request<Contact[]>(path),
    create: (value: ContactInput) => request<Contact>(path, { method: "POST", body: JSON.stringify(value) }),
    update: (id: string, value: ContactInput) => request<Contact>(`${path}/${id}`, { method: "PUT", body: JSON.stringify(value) }),
    remove: (id: string) => request<void>(`${path}/${id}`, { method: "DELETE" }),
  };
}

const API_URL = import.meta.env.VITE_API_URL ?? "";
export const AUTH_EXPIRED_EVENT = "reciptile:auth-expired";

export async function request<T>(
  path: string,
  options?: RequestInit,
  authenticated = true,
): Promise<T> {
  const token = authenticated
    ? sessionStorage.getItem("reciptile_token")
    : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && token) {
      sessionStorage.removeItem("reciptile_token");
      sessionStorage.removeItem("reciptile_user");
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ??
        (response.status === 401
          ? "Your session expired. Please sign in again."
          : `Request failed with status ${response.status}`),
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const productsApi = {
  list: () => request<Product[]>("/api/products", undefined, false),
  create: (product: CreateProductInput) =>
    request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  update: (id: string, product: CreateProductInput) =>
    request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  remove: (id: string) =>
    request<void>(`/api/products/${id}`, { method: "DELETE" }),
};

type PreparedImageUpload = {
  key: string;
  uploadUrl: string;
};

type UploadThingPutResponse = {
  key?: string;
  ufsUrl?: string;
  url?: string;
  appUrl?: string;
  error?: string;
};

export const uploadsApi = {
  async uploadProductImage(file: File): Promise<Omit<ProductImage, "alt">> {
    const prepared = await request<PreparedImageUpload>(
      "/api/uploads/product-images/prepare",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      },
    );

    const form = new FormData();
    form.append("file", file);
    const response = await fetch(prepared.uploadUrl, {
      method: "PUT",
      body: form,
    });
    const uploaded = (await response.json().catch(() => null)) as
      | UploadThingPutResponse
      | null;

    if (!response.ok || uploaded?.error) {
      throw new Error(uploaded?.error ?? "The product image upload failed");
    }

    const url = uploaded?.ufsUrl ?? uploaded?.url ?? uploaded?.appUrl;
    if (!url) throw new Error("UploadThing did not return an image URL");
    return { key: uploaded?.key ?? prepared.key, url };
  },
};

export const invoicesApi = {
  list: () => request<Invoice[]>("/api/invoices"),
  create: (invoice: CreateInvoiceInput) =>
    request<Invoice>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    }),
  update: (id: string, invoice: CreateInvoiceInput) =>
    request<Invoice>(`/api/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    }),
  remove: (id: string) =>
    request<void>(`/api/invoices/${id}`, { method: "DELETE" }),
};

export const customersApi = contactApi("/api/customers");
export const suppliersApi = contactApi("/api/suppliers");

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  change: number;
  balance: number;
  reason: string;
  reference: string | null;
  createdAt: string;
};

export const inventoryApi = {
  movements: () => request<StockMovement[]>("/api/inventory/movements"),
  adjust: (input: { productId: string; change: number; reason: string; reference?: string | null }) =>
    request<StockMovement>("/api/inventory/adjustments", { method: "POST", body: JSON.stringify(input) }),
};
