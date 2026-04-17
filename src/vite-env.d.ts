/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_SUPPORT_WHATSAPP_NUMBER?: string;
	readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
