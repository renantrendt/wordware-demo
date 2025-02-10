"use client"

import { useEffect } from "react"

export default function CompaniesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console
    console.error("Companies Page Error:", error)

    // Log error details
    if (typeof window !== "undefined") {
      console.error("Error Details:", {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
    }
  }, [error])

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-500">
          Error Loading Companies
        </h2>
        <p className="mb-4 text-gray-300">
          {error.message || "An unexpected error occurred while loading companies"}
        </p>
        {error.digest && (
          <p className="mb-4 text-sm text-gray-400">Error ID: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
