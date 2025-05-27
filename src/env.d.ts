/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_REFRESH_TOKEN_KEY: string
  readonly VITE_AUTH_API_URL: string
  readonly VITE_GALLERY_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
