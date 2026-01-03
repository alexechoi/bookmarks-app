"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-secondary-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-shadow group-[.toaster]:rounded-base",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-main group-[.toast]:text-main-foreground group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:rounded-base",
          cancelButton:
            "group-[.toast]:bg-secondary-background group-[.toast]:text-foreground group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:rounded-base",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
