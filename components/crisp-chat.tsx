'use client'

import { useEffect } from 'react'

declare global {
    interface Window {
        $crisp: any[]
        CRISP_WEBSITE_ID: string
    }
}

export function CrispChat() {
    useEffect(() => {
        window.$crisp = []
        window.CRISP_WEBSITE_ID = "48dd6d16-b2eb-4c46-8cb6-4214e897d9c9"

        const script = document.createElement("script")
        script.src = "https://client.crisp.chat/l.js"
        script.async = true
        document.head.appendChild(script)

        return () => {
            // Cleanup if needed
            document.head.removeChild(script)
        }
    }, [])

    return null
}
