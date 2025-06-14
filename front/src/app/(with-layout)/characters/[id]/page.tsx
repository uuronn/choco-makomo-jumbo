import { redirect } from "next/navigation";

export default function CharacterPage({ params }: { params: { id: string } }) {
	redirect("/characters");
}
