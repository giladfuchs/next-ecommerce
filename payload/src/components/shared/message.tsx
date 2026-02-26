import clsx from "clsx";

import type { ReactNode } from "react";

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
      className={clsx(
        "p-4 my-8 rounded-lg text-foreground",
        {
          "bg-[color:var(--success)]": Boolean(success),
          "bg-[color:var(--warning)]": Boolean(warning),
          "bg-[color:var(--error)]": Boolean(error),
        },
        className,
      )}
    >
      {content}
    </div>
  );
};
