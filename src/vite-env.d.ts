/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(): void
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
