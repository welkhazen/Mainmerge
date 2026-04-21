/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_STYTCH_PUBLIC_TOKEN?: string;
	readonly VITE_PUBLIC_POSTHOG_PROJECT_TOKEN?: string;
	readonly VITE_PUBLIC_POSTHOG_HOST?: string;
	readonly VITE_APP_VERSION?: string;
	readonly VITE_SENTRY_DSN?: string;
	readonly VITE_GA_MEASUREMENT_ID?: string;
	readonly VITE_CLARITY_PROJECT_ID?: string;
	readonly VITE_SUPPORT_WHATSAPP_NUMBER?: string;
	readonly VITE_SUPPORT_EMAIL?: string;
	readonly VITE_ENABLE_DIAGNOSTICS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
