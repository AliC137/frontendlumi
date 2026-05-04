import { request } from '@umijs/max';

// /
//  * Upload files to the backend for general storage (List.tsx)
//  * @param files - Array of File objects to upload
//  */
export async function uploadFile(files: File | File[]) {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];

  fileArray.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('for_rag_context', 'false');

  return request('/api/v1/rag/upload-file/', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    timeout: 600000,
  });
}

// /
//  * Upload files specifically for RAG context (ChatDialog.tsx)
//  * @param files - Array of File objects to upload for LLM context
//  */
export async function uploadFileForRAG(files: File | File[]) {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];

  fileArray.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('for_rag_context', 'true');

  return request('/api/v1/rag/upload-file/', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    timeout: 600000,
  });
}

// /
//  * Transcribe audio file using STT service
//  * @param audioBlob - Audio blob to transcribe
//  * @returns transcribed text
//  */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4')
    ? 'm4a'
    : audioBlob.type.includes('ogg')
      ? 'ogg'
      : 'webm';
  formData.append('file', audioBlob, `audio.${ext}`);

  const res = await request<unknown>('/api/v1/stt/tajik/', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    timeout: 600000,
    getResponse: true,
  });
  const payload = (res as { data?: { text?: string } }).data ?? res;
  const text =
    typeof (payload as { text?: string })?.text === 'string'
      ? (payload as { text: string }).text.trim()
      : '';
  return { text };
}

// /
//  * Ask a question to the RAG model
//  * @param question - User's question
//  * @returns response with the answer
//  */
export type ChatReplyLanguage = 'en-US' | 'ru-RU' | 'tj-TJ';

function replyLangParam(ui: ChatReplyLanguage | undefined): string {
  if (ui === 'ru-RU') return 'ru';
  if (ui === 'tj-TJ') return 'tg';
  if (ui === 'en-US') return 'en';
  return 'auto';
}

export async function askQuestion(params: {
  /** Full prompt for the model (may include recent chat turns). */
  question: string;
  /** Short text for embedding search only — omit noise from chat prefixes. */
  retrievalQuery: string;
  replyLanguage?: ChatReplyLanguage;
}): Promise<{ answer: string }> {
  const rl = replyLangParam(params.replyLanguage);
  // Query string so reply language survives proxies/clients that alter JSON bodies
  const qs = `reply_language=${encodeURIComponent(rl)}`;
  return request(`/api/v1/rag/query?${qs}`, {
    method: 'POST',
    data: {
      question: params.question,
      retrieval_query: params.retrievalQuery,
      reply_language: rl,
    },
    timeout: 600000,
  });
}

// /
//  * Trigger download of a file from S3 by filename only
//  * @param filename - Name of the file in the bucket
//  */
export function downloadFile(filename: string) {
  const encoded = encodeURIComponent(filename);
  window.open(`/api/v1/s3/download_file?filename=${encoded}`, '_blank');
}

//  * Get list of files in S3 bucket
//  * @returns array of file info objects
//  */
export async function listFiles(): Promise<
  Array<{ filename: string; path: string; download_url: string }>
> {
  return request('/api/v1/rag/list_files', {
    method: 'GET',
  });
}
