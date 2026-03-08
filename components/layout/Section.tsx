import type { ReactNode } from "react";
import { SectionTitle } from "@/components/ui/Typography";
import LastUpdated from "@/components/dashboard/LastUpdated";

interface SectionProps {
  title: string;
  icon?: ReactNode;
  fetchedAt?: string;
  children: ReactNode;
}

export default function Section({
  title,
  icon,
  fetchedAt,
  children,
}: SectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle className="flex items-center gap-2">
          {icon}
          {title}
        </SectionTitle>
        {fetchedAt && <LastUpdated fetchedAt={fetchedAt} />}
      </div>
      {children}
    </section>
  );
}
