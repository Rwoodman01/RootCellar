import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

type NativeButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = BaseProps & LinkProps;
type AnchorButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function classNames(variant: ButtonVariant, className?: string): string {
  return ["button", `button-${variant}`, className].filter(Boolean).join(" ");
}

export function Button({ children, variant = "primary", className, ...props }: NativeButtonProps) {
  return (
    <button className={classNames(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ children, variant = "primary", className, ...props }: LinkButtonProps) {
  return (
    <Link className={classNames(variant, className)} {...props}>
      {children}
    </Link>
  );
}

export function AnchorButton({ children, variant = "primary", className, ...props }: AnchorButtonProps) {
  return (
    <a className={classNames(variant, className)} {...props}>
      {children}
    </a>
  );
}
