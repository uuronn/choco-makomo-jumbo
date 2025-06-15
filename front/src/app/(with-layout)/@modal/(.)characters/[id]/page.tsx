import { CharacterModal } from "./components/CharacterModal";
import { fetchCharacterById } from "./functions/fetchCharacterById";

export default async function CharacterModalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const character = await fetchCharacterById(id);

	return <CharacterModal character={character} />;
}
