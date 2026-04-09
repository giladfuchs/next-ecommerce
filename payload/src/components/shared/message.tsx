import type { ReactNode } from "react";

import { cn } from "@/lib/core/util";

type Props = {
  className?: string;
  error?: ReactNode;
  message?: ReactNode;
  success?: ReactNode;
  warning?: ReactNode;
};

export const Message = ({
  className,
  error,
  message,
  success,
  warning,
}: Props) => {
  const content = message ?? error ?? success ?? warning;
  if (!content) return null;

  return (
    <div
      className={cn(
        "p-4 mt-4 rounded-lg text-foreground",
        {
          "bg-success": Boolean(success),
          "bg-warning": Boolean(warning),
          "bg-error": Boolean(error),
        },
        className,
      )}
    >
      {content}
    </div>
  );
};
