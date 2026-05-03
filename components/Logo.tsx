import Image from "next/image";
import clsx from "clsx";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; px: number }> = {
  sm: { box: "w-9 h-9", px: 36 },
  md: { box: "w-11 h-11", px: 44 },
  lg: { box: "w-14 h-14", px: 56 },
  xl: { box: "w-20 h-20", px: 80 },
};

export default function Logo({
  size = "md",
  className,
  priority = false,
}: {
  size?: Size;
  className?: string;
  priority?: boolean;
}) {
  const { box, px } = sizeMap[size];
  return (
    <span
      className={clsx(
        box,
        "inline-block flex-shrink-0 relative drop-shadow-[0_4px_10px_rgba(37,99,235,0.25)]",
        className,
      )}
    >
      <Image
        src="/images/logo.png"
        alt="ChemistryByKK logo"
        width={px}
        height={px}
        priority={priority}
        className="w-full h-full object-contain"
      />
    </span>
  );
}
