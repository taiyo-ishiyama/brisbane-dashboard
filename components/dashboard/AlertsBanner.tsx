"use client";

import { AlertTriangle, ShieldCheck, ExternalLink } from "lucide-react";
import type { EmergencyAlertsFeed } from "@/types/alerts";
import { CardTitle, Body, Caption } from "@/components/ui/Typography";
import LastUpdated from "./LastUpdated";

interface AlertsBannerProps {
  data: EmergencyAlertsFeed;
}

const severityStyles: Record<string, string> = {
  extreme: "bg-red-50 border-red-400 text-red-900",
  severe: "bg-amber-50 border-amber-400 text-amber-900",
  moderate: "bg-yellow-50 border-yellow-400 text-yellow-900",
  minor: "bg-blue-50 border-blue-400 text-blue-900",
  info: "bg-slate-50 border-slate-300 text-slate-700",
};

const severityIconStyles: Record<string, string> = {
  extreme: "text-red-600",
  severe: "text-amber-600",
  moderate: "text-yellow-600",
  minor: "text-blue-600",
  info: "text-slate-500",
};

export default function AlertsBanner({ data }: AlertsBannerProps) {
  if (data.alerts.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-700" />
          <Body as="span" className="!text-green-700">
            No active emergency alerts
          </Body>
        </div>
        <LastUpdated fetchedAt={data.meta.fetchedAt} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.alerts.map((alert) => {
        const style = severityStyles[alert.severity] ?? severityStyles.info;
        const iconStyle =
          severityIconStyles[alert.severity] ?? severityIconStyles.info;

        return (
          <div
            key={alert.id}
            className={`rounded-lg border-l-4 px-4 py-3 ${style}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${iconStyle}`} />
                <div>
                  <CardTitle as="p" className="!text-inherit">
                    {alert.title}
                  </CardTitle>
                  {alert.summary && (
                    <Body className="mt-0.5 opacity-80 !text-inherit">
                      {alert.summary}
                    </Body>
                  )}
                  {alert.areas && alert.areas.length > 0 && (
                    <Caption as="p" className="mt-1 opacity-60 !text-inherit">
                      Areas: {alert.areas.join(", ")}
                    </Caption>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <LastUpdated fetchedAt={data.meta.fetchedAt} />
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
