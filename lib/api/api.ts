import {
  Order,
  OrderStatus,
  ModelType,
  AGTableModelType,
  NewOrderPayload,
} from "../types";
import { API_URL, USE_MOCK_DATA } from "../config/config";
import { cache } from "./cache";
type Callback = (loading: boolean) => void;

let subscribers: Callback[] = [];

export function setGlobalLoading(value: boolean) {
  subscribers.forEach((cb) => cb(value));
}

export function subscribeGlobalLoading(cb: Callback) {
  subscribers.push(cb);
  return () => {
    subscribers = subscribers.filter((fn) => fn !== cb);
  };
}

export async function serverFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    redirect,
    headers, // unused in your usage
    cache: initCache,
    body,
    ...restInit
  } = init;

  const isBrowser = typeof window !== "undefined";
  const token = isBrowser ? localStorage.getItem("token") : null;

  let finalBody = body;
  const finalHeaders: Record<string, string> = {};

  if (body && !(body instanceof FormData)) {
    finalBody = JSON.stringify(body);
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (isBrowser) setGlobalLoading(true);

  try {
    if (USE_MOCK_DATA) {
      const { mockResponse } = require("./mock-api");
      return await mockResponse(input);
    }

    return await fetch(`${API_URL}${input}`, {
      ...restInit,
      headers: finalHeaders,
      body: finalBody,
      credentials: "include",
      cache: initCache || "no-store",
    });
  } finally {
    if (isBrowser) setGlobalLoading(false);
  }
}

async function handleResponse<T = any>(
  response: Response,
  context: string,
): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error(`❌ Failed to ${context}`);
    throw new Error(err?.error || `Failed to ${context}`);
  }
  return response.json();
}

export async function fetchData(force = false) {
  if (!force && cache.isFresh()) {
    return cache.get();
  }

  const inflight = cache.getInFlight();
  if (!force && inflight) {
    return inflight;
  }

  const promise = serverFetch(`/data`)
    .then((res) =>
      handleResponse(res, "fetch data").then((data) => {
        cache.set(data);
        return data;
      }),
    )
    .finally(() => {
      cache.setInFlight(null);
    });

  cache.setInFlight(promise);
  return promise;
}

export async function deleteModel(model: ModelType, id: number): Promise<void> {
  const res = await serverFetch(`/auth/${model}/${id}`, {
    method: "DELETE",
  });
  await handleResponse(res, "delete model");
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await serverFetch(`/auth/image`, {
    method: "POST",
    body: formData,
  });

  const data = await handleResponse<{ url: string }>(res, "upload image");
  return data.url;
}

export async function submitModel(
  model: ModelType,
  idOrAdd: string,
  body: any,
): Promise<AGTableModelType> {
  const res = await serverFetch(`/auth/${model}/${idOrAdd}`, {
    method: "POST",
    body,
  });

  return await handleResponse<AGTableModelType>(res, "submit model");
}

export async function submitOrder(order: NewOrderPayload): Promise<Order> {
  const res = await serverFetch(`/checkout`, {
    method: "POST",
    body: order as any,
  });

  return handleResponse<Order>(res, "submit order");
}

export async function getOrders(): Promise<Order[]> {
  const res = await serverFetch(`/auth/orders`);
  return handleResponse(res, "fetch orders");
}

export async function getOrderById(id: number): Promise<Order | null> {
  const res = await serverFetch(`/auth/order/${id}`);
  if (!res.ok) {
    console.error("❌ Failed to fetch order");
    return null;
  }
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<Order> {
  const res = await serverFetch(`/auth/order/status`, {
    method: "POST",
    body: { id, status } as any,
  });

  return handleResponse(res, "update order status");
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ token: string }> {
  const res = await serverFetch(`/login`, {
    method: "POST",
    body: { username, password } as any,
  });

  return handleResponse(res, "login");
}
