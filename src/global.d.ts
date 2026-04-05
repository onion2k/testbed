export {}

declare module '*.md?raw' {
  const content: string
  export default content
}

declare global {
  interface Window {
    desktopBridge?: {
      isDesktop: boolean
      getContext: () => Promise<{
        serverUrl: string | null
        port: number | null
        usedFallbackPort: boolean
        dataDirectory: string | null
        adminApiToken: string | null
      }>
      selectDataDirectory: () => Promise<{
        serverUrl: string | null
        port: number | null
        usedFallbackPort: boolean
        dataDirectory: string | null
        adminApiToken: string | null
      }>
      openDataDirectory: () => Promise<{
        serverUrl: string | null
        port: number | null
        usedFallbackPort: boolean
        dataDirectory: string | null
        adminApiToken: string | null
      }>
    }
  }
}
