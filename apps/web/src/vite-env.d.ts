/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_H3_RESOLUTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
