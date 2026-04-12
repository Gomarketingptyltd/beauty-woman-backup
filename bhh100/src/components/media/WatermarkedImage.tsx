"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";

type Props = Omit<ImageProps, "alt"> & {
  alt: string;
  watermarkText?: string;
  className?: string;
  imgClassName?: string;
};

/**
 * 展示层水印：中心半透明站点域名。
 * 上传前去除 EXIF / 合成水印建议在 Canvas 流程中完成（见后续迭代）。
 */
export function WatermarkedImage({
  watermarkText = "bhh100.com",
  className,
  imgClassName,
  alt,
  fill,
  ...rest
}: Props) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        {...rest}
        alt={alt}
        fill={fill}
        className={cn("object-cover", imgClassName)}
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <span
          className="select-none text-lg font-semibold tracking-wider text-white/35 sm:text-xl"
          style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.6)" }}
        >
          {watermarkText}
        </span>
      </div>
    </div>
  );
}
