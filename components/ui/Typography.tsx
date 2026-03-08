import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type TextProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "children" | "className">;

function createText<D extends ElementType>(defaultTag: D, base: string) {
  function TextComponent<T extends ElementType = D>({
    as,
    className,
    children,
    ...rest
  }: TextProps<T>) {
    const Tag: ElementType = as ?? defaultTag;
    return (
      <Tag className={className ? `${base} ${className}` : base} {...rest}>
        {children}
      </Tag>
    );
  }
  return TextComponent;
}

/** Page header title — `<h1>` */
export const PageTitle = createText("h1", "text-lg sm:text-xl font-bold text-slate-900");

/** Section heading — `<h2>` */
export const SectionTitle = createText("h2", "text-lg font-semibold text-slate-900");

/** Column / sub-panel heading — `<h3>` */
export const SubsectionTitle = createText("h3", "text-sm font-semibold text-slate-700");

/** Card heading (events, alerts) — `<h3>` */
export const CardTitle = createText("h3", "font-semibold text-slate-900 leading-snug");

/** Default body text / descriptions — `<p>` */
export const Body = createText("p", "text-sm text-slate-500");

/** Emphasised body (item titles) — `<p>` */
export const BodyMedium = createText("p", "text-sm font-medium text-slate-800");

/** Small metadata (dates, venues) — `<span>` */
export const Caption = createText("span", "text-xs text-slate-500");

/** Lighter secondary text — `<span>` */
export const Muted = createText("span", "text-xs text-slate-400");

/** Extra-small detail (locations, wind speed) — `<span>` */
export const Tiny = createText("span", "text-[11px] text-slate-400");

/** Badge / tag text — `<span>` */
export const Label = createText("span", "text-[10px] font-semibold");

/** Large display values (temperature high) — `<span>` */
export const Display = createText("span", "text-lg font-bold text-slate-900");

/** Secondary display values (temperature low) — `<span>` */
export const DisplaySecondary = createText("span", "text-sm text-slate-400");
