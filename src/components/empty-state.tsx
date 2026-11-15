import type { ReactNode } from "react";
 
type EmptyStateProps = {
  title: string;
  children: ReactNode;
};
 
export function EmptyState({ title, children }: EmptyStateProps) {
  return (
	<div className="panel text-center">
  	<h2 className="text-lg font-semibold">{title}</h2>
  	<p className="text-sm text-slate-600">{children}</p>
	</div>
  );
}
