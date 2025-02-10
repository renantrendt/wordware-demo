const isDevelopment = process.env.NODE_ENV === "development"

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    // Sempre loga erros, mesmo em produção
    console.error(...args)
    
    // Em produção, você pode adicionar aqui a lógica para enviar erros
    // para um serviço de monitoramento como Sentry, LogRocket, etc.
    if (!isDevelopment && typeof window !== "undefined") {
      const errorDetails = {
        message: args[0],
        additionalInfo: args.slice(1),
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        timestamp: new Date().toISOString(),
      }
      
      // Log para console em formato estruturado
      console.error("Error Details:", errorDetails)
      
      // Aqui você pode adicionar a integração com serviços de monitoramento
      // Por exemplo:
      // Sentry.captureException(args[0], { extra: errorDetails })
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
}
