"use client";

import { useState } from "react";

export default function CsrPage() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<h1>CSR Page</h1>
			<button type="button" onClick={() => setCount(count + 1)}>
				{count}
			</button>
		</div>
	);
}
