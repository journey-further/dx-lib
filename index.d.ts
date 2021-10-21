export {};
// Globals that we need in the lib
declare global {
  interface Window {
    dataLayer: any;
  }
}

export type ParsedTimeObject = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};
