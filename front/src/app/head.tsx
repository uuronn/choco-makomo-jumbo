export default function Head() {
	return (
		<>
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta
				name="apple-mobile-web-app-status-bar-style"
				content="black-translucent"
			/>
			<link rel="manifest" href="/manifest.json" />
			<link rel="apple-touch-icon" href="/icons/icon-192.png" />
		</>
	);
}
