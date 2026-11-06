import { httpApi } from "./api/httpApi";
import { mockApi } from "./api/mockApi";
import { USE_MOCK_API } from "./constants";
import { ApiError, type Api } from "./types";

const transport: Api = USE_MOCK_API ? mockApi : httpApi;

export const listUsers = () => transport.listUsers();
export const getSite = (address: string) => transport.getSite(address);
export const searchSites = (query: string) => transport.search(query);
export const publishSite = (input: Parameters<Api["publishSite"]>[0]) =>
  transport.publishSite(input);
export const listVisits = (userId: string) => transport.listVisits(userId);
export const recordVisit: Api["recordVisit"] = (userId, visit) =>
  transport.recordVisit(userId, visit);

export const api: Api = {
  listUsers,
  getSite,
  search: searchSites,
  publishSite,
  listVisits,
  recordVisit,
};

export { ApiError };
