import { SectionContainer } from "~/components/SectionContainer";
import CharacterList from "../../characters/components/CharacterList";

export const SelectCharacterContainer = () => {
	return (
		<div className="flex gap-4 max-h-1/2 mb-4">
			<SectionContainer title="選択中の技術" className="h-full">
				test
			</SectionContainer>
			<SectionContainer title="所持技術" className="h-full">
				<CharacterList />
			</SectionContainer>
		</div>
	);
};
