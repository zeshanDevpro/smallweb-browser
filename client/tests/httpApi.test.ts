import { AxiosHeaders, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../src/lib/api/axiosInstance";
import { ApiError } from "../src/lib/types";
import { httpApi } from "../src/lib/api/httpApi";

function response<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

function requestFailure(
  body: unknown,
  status: number,
): Error & { isAxiosError: true; response: { data: unknown; status: number } } {
  return Object.assign(new Error("Request failed"), {
    isAxiosError: true as const,
    response: { data: body, status },
  });
}

describe("httpApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when a site request returns 404", async () => {
    vi.spyOn(axiosInstance, "get").mockRejectedValue(
      requestFailure(
        { code: "NOT_FOUND", message: "No such site." },
        404,
      ),
    );

    await expect(httpApi.getSite("missing.zz")).resolves.toBeNull();
  });

  it("maps a 409 publish response to TAKEN", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      requestFailure({ code: "TAKEN", message: "Address is taken." }, 409),
    );

    await expect(
      httpApi.publishSite({
        address: "used.zz",
        title: "Used",
        body: "<p>Body</p>",
        authorId: "user-1",
      }),
    ).rejects.toMatchObject({ code: "TAKEN", message: "Address is taken." });
  });

  it("maps a 400 publish response to INVALID", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      requestFailure({ code: "INVALID", message: "Invalid address." }, 400),
    );

    await expect(
      httpApi.publishSite({
        address: "invalid",
        title: "Invalid",
        body: "<p>Body</p>",
        authorId: "user-1",
      }),
    ).rejects.toMatchObject({ code: "INVALID", message: "Invalid address." });
  });

  it("returns a friendly error when the API cannot be reached", async () => {
    vi.spyOn(axiosInstance, "get").mockRejectedValue(
      Object.assign(new Error("offline"), { isAxiosError: true }),
    );

    await expect(httpApi.listUsers()).rejects.toMatchObject({
      code: "NETWORK",
      message: expect.stringContaining("Check that the server is running."),
    });
  });

  it("does not send found when recording a visit", async () => {
    const post = vi.spyOn(axiosInstance, "post").mockResolvedValue(
      response({
        id: "visit-1",
        address: "tidepool.zz",
        title: "Tidepool",
        at: "2026-11-05T00:00:00.000Z",
        via: "typed",
        found: true,
      }),
    );

    await httpApi.recordVisit("user-1", {
      address: "tidepool.zz",
      via: "typed",
    });

    expect(post.mock.calls[0]?.[1]).toEqual({
      address: "tidepool.zz",
      via: "typed",
    });
    expect(post.mock.calls[0]?.[1]).not.toHaveProperty("found");
  });

  it("throws the mapped response as an ApiError", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      requestFailure({ code: "TAKEN", message: "Address is taken." }, 409),
    );

    await expect(
      httpApi.publishSite({
        address: "used.zz",
        title: "Used",
        body: "<p>Body</p>",
        authorId: "user-1",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
