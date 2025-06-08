import { CharacterModalClient } from "./components/CharacterModalClient";

export default async function CharacterModalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return <CharacterModalClient id={id} />;
}
