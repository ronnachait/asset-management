"use client";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

export default function Images({ src, alt }: Props) {
  return <Image className="object-cover w-32 h-32" src={src} alt={alt} width={75} height={75} />;
}
