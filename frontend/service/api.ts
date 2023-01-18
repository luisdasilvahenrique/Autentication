import axios, { AxiosError } from "axios";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import Router from 'next/router';
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
// @ts-ignore
let failedRequestQueue = [];

export function setupApiClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });
  
  function singOut(){
    destroyCookie(undefined, 'nextauth.token'),
    destroyCookie(undefined, 'nextauth.refreshToken')
  
    Router.push('/')
  }
  
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // @ts-ignore // isso daqui é massa -> ignora tipos "any"
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);
  
          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;
  
          if (!isRefreshing) {
            isRefreshing = true;
  
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;
  
                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/",
                  }
                );
  
                api.defaults.headers["Authorization"] = `Bearer ${token}`;
                // @ts-ignore
                failedRequestQueue.forEach((request) => request.resolve(token));
                failedRequestQueue = [];
              }).catch(err => {
                // @ts-ignore
                failedRequestQueue.forEach((request) => request.reject(err));
                failedRequestQueue = [];
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
  
          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              resolve: (token: string) => {
                
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                
                resolve(api(originalConfig));
              },
              reject: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        }
      } else {
        if (typeof window === 'undefined'){
          singOut(); 
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }
      
      return Promise.reject(error);
    });

    return api;
}
    