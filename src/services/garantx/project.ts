// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import AsyncLocalStorage from '@createnextapp/async-local-storage';
import { postData, getData, patchData, deleteData } from './api';

export async function getProjects() {
  console.log('getProjects');
  const data = await getData('projects');
  return data.items;
}

export async function addProject(body) {
  console.log('addProject', body);
  const data = await postData('project', body);
  return data.item;
}

export async function updateProject(id, body) {
  console.log('updateProject', body);
  const data = await patchData(`project/${id}`, body);
  return data.item;
}

export async function saveProject(body) {
  if (body.id !== undefined && body.id !== null && body.id !== '')
    return updateProject(body.id, body);
  return addProject(body);
}

export async function deleteProject(id) {
  console.log('deleteProject', id);
  //const data = await loginRequest(body, options);
  const data = await deleteData(`project/${id}`);
  return data.state;
}
