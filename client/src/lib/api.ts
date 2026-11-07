import { httpApi } from "./api/httpApi";
import { ApiError, type Api } from "./types";

export const listUsers = () => httpApi.listUsers();
export const getSite = (address: string) => httpApi.getSite(address);
export const searchSites = (query: string) => httpApi.search(query);
export const publishSite = (input: Parameters<Api["publishSite"]>[0]) =>
  httpApi.publishSite(input);
export const listVisits = (userId: string) => httpApi.listVisits(userId);
export const recordVisit: Api["recordVisit"] = (userId, visit) =>
  httpApi.recordVisit(userId, visit);

export const api: Api = {
  listUsers,
  getSite,
  search: searchSites,
  publishSite,
  listVisits,
  recordVisit,
};

export { ApiError };
