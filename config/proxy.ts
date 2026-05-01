/** Dev proxy timeouts (ms) — long-running upload + embedding + LLM/RAG must not hit 504. */
const apiProxy = {
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  // Keep full path (/api/v1/...) — do not rewrite (wrong rewrites caused 404 upstream).
  timeout: 600000,
  proxyTimeout: 600000,
  onProxyReq: (proxyReq: any, req: any) => {
    if (typeof req?.setTimeout === 'function') {
      req.setTimeout(600000);
    }
  },
};

export default {
  dev: {
    '/api/': apiProxy,
  },
  test: {
    '/api/': apiProxy,
  },
  pre: {
    '/api/': apiProxy,
  },
};
