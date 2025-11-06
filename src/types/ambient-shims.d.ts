// Triage ambient module shims to silence missing-type errors for third-party libs
// These are intentionally permissive and should be hardened later.
// Broad module shims (triage). Later replace with precise declarations for each symbol used.
declare module 'antd' {
	// common named exports used across the codebase
	export type MenuProps = any;
	export const ColorPicker: any;
	export const Descriptions: any;
	export const QRCode: any;
	export const TimePicker: any;
	export const notification: any;
	export const Image: any;
	export const Result: any;
	export const theme: any;
	export const DescriptionsItem: any;
	export default any;
}

declare module 'recharts' {
	const recharts: any;
	export = recharts;
}

declare module 'mermaid';
declare module 'puppeteer' {
	export type CDPSession = any;
	export const BrowserContext: any;
	export function launch(...args: any[]): any;
	const _default: any;
	export default _default;
}
declare module 'express-validator';
declare module 'rate-limit-redis';
declare module 'jsdom';
declare module 'lucide-react' {
	// Provide permissive icon exports (add more names as needed)
	export const Play: any;
	export const Pause: any;
	export const CheckCircle: any;
	export const AlertTriangle: any;
	export const Activity: any;
	export const Brain: any;
	export const BarChart3: any;
	export const Cpu: any;
	export const Layers: any;
	export const Target: any;
	export const RefreshCw: any;
	export const Plus: any;
	export const Square: any;
	export const XCircle: any;
	export const Download: any;
	export const Upload: any;
	export default any;
}

declare module 'ethers' {
	export const utils: any;
	export default any;
}
declare module '@modelcontextprotocol/sdk/types.js';

declare global {
	interface Window {
		chrome?: any;
	}
}

// Express augmentation for Multer (triage)
declare namespace Express {
	interface Multer {
		// minimal placeholder
		single?: (...args: any[]) => any;
		array?: (...args: any[]) => any;
		fields?: (...args: any[]) => any;
		any?: (...args: any[]) => any;
	}

	// Provide Multer.File shape so imports like Express.Multer.File compile during triage
	namespace Multer {
		interface File {
			fieldname?: string;
			originalname?: string;
			encoding?: string;
			mimetype?: string;
			size?: number;
			buffer?: any;
			destination?: string;
			filename?: string;
			path?: string;
			[key: string]: any;
		}
	}
}

export {};
