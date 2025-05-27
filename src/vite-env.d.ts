/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_GALLERY_API_URL: string;
  readonly VITE_USER_API_URL: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_REFRESH_TOKEN_KEY: string;
  readonly VITE_DEVICE_TOKEN_KEY: string;
  readonly VITE_IMAGE_STORAGE_URL: string;
  readonly VITE_THUMBNAIL_STORAGE_URL: string;
  readonly VITE_ASSET_STORAGE_URL: string;
  readonly VITE_MEDIA_PROCESSOR_URL: string;
  readonly VITE_ENABLE_ARTIST_FEATURES: string;
  readonly VITE_ENABLE_SUBSCRIPTIONS: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
