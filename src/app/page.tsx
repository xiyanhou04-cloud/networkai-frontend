import { Workspace } from "@/components/workspace";

 
export default function Home() {
  return (
	<main id="main-content" className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
  	<header className="space-y-2">
    	<h1 className="text-3xl font-semibold sm:text-4xl">Discover</h1>
    	<p className="text-slate-600">Find images and ideas shared by the community.</p>
  	</header>
  	<Workspace />
	</main>
  );
}
