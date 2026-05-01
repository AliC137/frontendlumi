// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import AsyncLocalStorage from '@createnextapp/async-local-storage';
import { saveToken, getToken, saveUserInfo, getStorageUserInfo, loginRequest } from './api';

export async function outLogin(options?: { [key: string]: any }) {
  await saveToken();
  await saveUserInfo();
}

export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  console.log('garantx login', body);
  const data = await loginRequest(body, options);
  /*
  const data = await request<API.LoginData>('http://garantx.local/api/v1/user-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
*/
  console.log('login data', data);

  const currentUser = {
    id: data.success.user.id,
    name: data.success.user.name,
    email: data.success.user.email,
    access: 'admin',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  };

  let result: API.LoginResult = {
    status: 'ok',
    type: 'Admin',
    currentAuthority: '',
    user: currentUser,
  };
  await saveToken(data.success.token);
  await saveUserInfo(currentUser);

  return result;
}

export async function getUserInfo(options?: { [key: string]: any }) {
  const currentUserInfo: API.User = await getStorageUserInfo();
  let result: API.LoginResult = {
    status: 'ok',
    type: 'Admin',
    currentAuthority: '',
    user: currentUserInfo,
  };
  return result;
}
