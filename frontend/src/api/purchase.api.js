import api from './axios';// 👈 use SAME axios file you use elsewhere

export const getMyPurchases = () => {
  return api.get("/api/purchases/my/bought");
};

export const getMySales = () => {
  return api.get("/api/purchases/my/sold");
};
