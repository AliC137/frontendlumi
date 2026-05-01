// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import AsyncLocalStorage from '@createnextapp/async-local-storage';
import { postData, getData, patchData, deleteData, getAPIAddress } from './api';

export async function getProjectView(project_id) {
  const data = await getData(`project/${project_id}/views`);
  return data.items;
}

export async function addFolder(view_id, view_folder_id, name) {
  let func = `view/${view_id}/folder`;
  if (view_folder_id !== null) func = `view/${view_id}/folder/${view_folder_id}/folder`;

  const data = await postData(func, { name });
  return data.item;
}

export async function getGoogleId(id) {
  const data = await getData(`document/${id}/google`);
  return data.googleId;
}

export async function addDocument(view_id, view_folder_id, name, ext, source_id) {
  let func = `view/${view_id}/document`;
  if (view_folder_id !== null) func = `view/${view_id}/folder/${view_folder_id}/document`;

  const data = await postData(func, { name, ext, source_id });
  return data.item;
}

export async function getDocuments(view_id, view_folder_id) {
  let func = `view/${view_id}/documents`;
  if (view_folder_id !== null) func = `view/${view_id}/folder/${view_folder_id}/documents`;

  const data = await getData(func);
  return data.items;
}

export function getUploadAction() {
  return getAPIAddress(`document/upload`);
}

export async function addProjectView(body) {
  console.log('addProject', body);
  const data = await postData('project', body);
  return data.item;
}

export async function updateProjectView(id, body) {
  console.log('updateProject', body);
  const data = await patchData(`project/${id}`, body);
  return data.item;
}

export async function saveProjectView(body) {
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
