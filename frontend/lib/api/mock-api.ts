import { array_obj_to_obj_with_key } from "../helper";

import mockData from "./mock-data.json";

export async function mockResponse(input: string): Promise<Response> {
  let json;

  if (input === "/data") {
    json = {
      products: mockData.products,
      categories: mockData.categories,
    };
  } else if (input === "/auth/orders") {
    json = mockData.orders;
  } else if (input.startsWith("/auth/order/")) {
    const id = Number(input.split("/").pop());
    json = array_obj_to_obj_with_key(mockData.orders, id, "id");
  } else if (input === "/login") {
    json = { token: "token" };
  } else {
    return new Response(
      JSON.stringify({
        error: "❌ This route is not mocked: " + input,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
