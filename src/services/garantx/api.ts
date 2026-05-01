// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import AsyncLocalStorage from '@createnextapp/async-local-storage';

let HTTP_APP_SERVER = 'http://garantx.local/api/v1/';
if (process.env.NODE_ENV == 'development') HTTP_APP_SERVER = 'http://garantx.local/api/v1/';

export async function saveToken(token: string = undefined) {
  await AsyncLocalStorage.setItem('token', token);
}
export async function getToken() {
  return AsyncLocalStorage.getItem('token');
}
export function getTokenSync() {
  return localStorage.getItem('token');
}

export async function saveUserInfo(user: API.User = undefined) {
  await AsyncLocalStorage.setItem('userInfo', JSON.stringify(user));
}
export async function getStorageUserInfo() {
  const strObject = await AsyncLocalStorage.getItem('userInfo');
  let user;
  if (strObject !== undefined && strObject !== null) user = JSON.parse(strObject);
  return user;
}

export function getAPIAddress(func) {
  return `${HTTP_APP_SERVER}${func}`;
}

export async function loginRequest(body, options) {
  return await request<API.LoginData>(getAPIAddress('user-login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function postData(func, body, options?: { [key: string]: any }) {
  const result = await request<API.ResponseData>(getAPIAddress(func), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    data: body,
    ...(options || {}),
  });
  return result.data;
}

export async function getData(func, options?: { [key: string]: any }) {
  const result = await request<API.ResponseData>(getAPIAddress(func), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    ...(options || {}),
  });
  return result.data;
}

export async function patchData(func, body, options?: { [key: string]: any }) {
  const result = await request<API.ResponseData>(getAPIAddress(func), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    data: body,
    ...(options || {}),
  });
  return result.data;
}

export async function deleteData(func, options?: { [key: string]: any }) {
  const result = await request<API.ResponseData>(getAPIAddress(func), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    },
    ...(options || {}),
  });
  return result.data;
}

export function getAuthHeader() {
  return 'Bearer ' + getTokenSync();
}
