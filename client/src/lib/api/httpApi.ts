import axios from "axios";
import axiosInstance from "./axiosInstance";
import {
  NETWORK_ERROR_MESSAGE,
  SERVER_API_ERROR_CODES,
  VIA_VALUES,
} from "../constants";
import { ApiError } from "../types";
import type {
  Api,
  ApiErrorResponse,
  JsonRecord,
  PublishInput,
  SearchHit,
  Site,
  User,
  Via,
  Visit,
} from "../types";

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): value is string {
  return typeof value === "string";
}

function isVia(value: unknown): value is Via {
  return VIA_VALUES.some((via) => via === value);
}

function decodeUser(value: unknown): User {
  if (isRecord(value) && requiredString(value.id) && requiredString(value.name)) {
    return { id: value.id, name: value.name };
  }
  throw new ApiError("NETWORK", "The API returned an invalid user.");
}

function decodeSite(value: unknown): Site {
  if (
    isRecord(value) &&
    requiredString(value.address) &&
    requiredString(value.title) &&
    requiredString(value.body) &&
    requiredString(value.updatedAt)
  ) {
    return {
      address: value.address,
      title: value.title,
      body: value.body,
      updatedAt: value.updatedAt,
      author: decodeUser(value.author),
    };
  }
  throw new ApiError("NETWORK", "The API returned an invalid site.");
}

function decodeSearchHit(value: unknown): SearchHit {
  if (
    isRecord(value) &&
    requiredString(value.address) &&
    requiredString(value.title) &&
    requiredString(value.snippet)
  ) {
    return {
      address: value.address,
      title: value.title,
      snippet: value.snippet,
    };
  }
  throw new ApiError("NETWORK", "The API returned an invalid search result.");
}

function decodeVisit(value: unknown): Visit {
  if (
    isRecord(value) &&
    requiredString(value.id) &&
    requiredString(value.address) &&
    (requiredString(value.title) || value.title === null) &&
    requiredString(value.at) &&
    isVia(value.via) &&
    typeof value.found === "boolean"
  ) {
    return {
      id: value.id,
      address: value.address,
      title: value.title,
      at: value.at,
      via: value.via,
      found: value.found,
    };
  }
  throw new ApiError("NETWORK", "The API returned an invalid visit.");
}

function decodeArray<T>(value: unknown, decode: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) {
    throw new ApiError("NETWORK", "The API returned an invalid list.");
  }
  return value.map(decode);
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    requiredString(value.message) &&
    SERVER_API_ERROR_CODES.some((code) => code === value.code)
  );
}

function throwRequestError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  if (isApiErrorResponse(error.response?.data)) {
    throw new ApiError(error.response.data.code, error.response.data.message);
  }
  if (!error.response) {
    throw new ApiError(
      "NETWORK",
      NETWORK_ERROR_MESSAGE,
    );
  }
  throw new ApiError(
    "NETWORK",
    `The API request failed with status ${error.response.status}.`,
  );
}

async function request<T>(operation: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await operation;
    return response.data;
  } catch (error) {
    return throwRequestError(error);
  }
}

export const httpApi: Api = {
  async listUsers() {
    return decodeArray(await request(axiosInstance.get<unknown>("/users")), decodeUser);
  },

  async getSite(address) {
    try {
      const payload = await request(
        axiosInstance.get<unknown>(`/sites/${encodeURIComponent(address)}`),
      );
      return decodeSite(payload);
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") return null;
      throw error;
    }
  },

  async search(query) {
    const response = await request(
      axiosInstance.get<unknown>("/search", { params: { q: query } }),
    );
    return decodeArray(response, decodeSearchHit);
  },

  async publishSite(input: PublishInput) {
    return decodeSite(
      await request(axiosInstance.post<unknown>("/sites", input)),
    );
  },

  async listVisits(userId) {
    return decodeArray(
      await request(
        axiosInstance.get<unknown>(
          `/users/${encodeURIComponent(userId)}/visits`,
        ),
      ),
      decodeVisit,
    );
  },

  async recordVisit(userId, visit) {
    const result = await request(
      axiosInstance.post<unknown>(
        `/users/${encodeURIComponent(userId)}/visits`,
        { address: visit.address, via: visit.via },
      ),
    );
    return decodeVisit(result);
  },
};
