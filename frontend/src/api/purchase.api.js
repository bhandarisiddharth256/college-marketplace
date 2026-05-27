import api from './axios';// 

export const getMyPurchases = () => {
  return api.get("/api/purchases/my/bought");
};

export const getMySales = () => {
  return api.get("/api/purchases/my/sold");
};
