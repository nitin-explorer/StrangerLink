"use client"

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	console.error('Global route error:', error)

	return (
		<div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 px-4">
			<p className="text-lg">Something went wrong loading this page.</p>
			<p className="text-sm text-gray-600">Please try refreshing.</p>
		</div>
	)
}
