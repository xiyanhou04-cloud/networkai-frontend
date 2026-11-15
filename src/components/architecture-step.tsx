import type { ReactNode } from "react";
 
type ArchitectureStepProps = {
  title: string;
  children: ReactNode;
};
 
export function ArchitectureStep({ title, children }: ArchitectureStepProps) {
  return (
	<li className="panel">
  	<h2 className="font-semibold">{title}</h2>
      <p>{children}</p>
	</li>
  );
}
