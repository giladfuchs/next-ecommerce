import { setGlobalLoading } from "@/lib/provider/LoadingProvider";

import { API_URL, isTest, USE_MOCK_DATA } from "../config";

import type {
  Order,
  OrderStatus,
  ModelType,
  AGTableModelType,
  NewOrderPayload,
  ResponseData,
  FieldValue,
} from "../types";

type ServerFetchInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function serverFetch(
  input: string,
  init: ServerFetchInit = {},
): Promise<Response> {
  const { body, ...restInit } = init;

  const isBrowser = typeof window !== "undefined";

  let finalBody: BodyInit | undefined = undefined;
  const finalHeaders: Record<string, string> = {};

  if (body != null) {
    if (body instanceof FormData) {
      finalBody = body;
    } else {
      finalBody = JSON.stringify(body);
      finalHeaders["Content-Type"] = "application/json";
    }
  }

  if (isBrowser) {
    setGlobalLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const fetchInit: RequestInit = {
    ...restInit,
    headers: finalHeaders,
    body: finalBody,
  };

  if (!isBrowser && !isTest) {
    const serverInit = fetchInit as RequestInit & {
      next: { revalidate: number };
    };
    serverInit.cache = "force-cache";
    serverInit.next = { revalidate: 60 };
  }

  try {
    if (USE_MOCK_DATA) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { mockResponse } = require("./mock-api");
      return await mockResponse(input);
    }

    return await fetch(`${API_URL}${input}`, fetchInit);
  } finally {
    if (isBrowser) setGlobalLoading(false);
  }
}

export async function handleResponse<T>(
  response: Response,
  context: string,
): Promise<T> {
  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (response.status === 401 && typeof window !== "undefined") {
      console.warn("⛔ Unauthorized — clearing token and redirecting to login");
      localStorage.clear();
      window.location.href = "/login";
    }

    console.error(`❌ Failed to ${context}`);
    throw new Error(err.error || `Failed to ${context}`);
  }

  return (await response.json()) as T;
}

let inFlight: Promise<ResponseData> | null = null;

export async function getData(): Promise<ResponseData> {
  if (inFlight) return inFlight;

  inFlight = serverFetch("/data")
    .then((res) => handleResponse<ResponseData>(res, "init data"))
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export async function deleteModel(model: ModelType, id: number): Promise<void> {
  const res = await serverFetch(`/auth/${model}/${id}/delete`, {
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
  body: Record<string, FieldValue>,
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
    body: order,
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
    body: { id, status },
  });

  return handleResponse(res, "update order status");
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ token: string }> {
  const res = await serverFetch(`/login`, {
    method: "POST",
    body: { username, password },
  });

  return handleResponse(res, "login");
}

export async function registerUser(body: {
  username: string;
  password: string;
  email: string;
}): Promise<{ token: string }> {
  const res = await serverFetch(`/register`, {
    method: "POST",
    body: body,
  });

  return handleResponse(res, "login");
}

export async function resetMockDb(): Promise<{ token: string }> {
  const res = await serverFetch(`/reset_mock_db`);
  return handleResponse(res, "reset_mock_db");
}
