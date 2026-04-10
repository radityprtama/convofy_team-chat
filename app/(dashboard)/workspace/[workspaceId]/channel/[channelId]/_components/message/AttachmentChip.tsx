import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface AttachmentChipProps {
    url: string;
    onRemove: () => void;
}

export function AttachmentChip({ url, onRemove }: AttachmentChipProps) {
    return (
        <div
            className="
        group relative overflow-hidden rounded-xl size-14
        ring-1 ring-black/8 dark:ring-white/10
        transition-all duration-300 cursor-pointer
        hover:ring-black/20 dark:hover:ring-white/20
        hover:scale-[1.03]
      "
        >
            <Image
                src={url}
                alt="Attachment"
                fill
                className="
          object-cover transition-all duration-300
          group-hover:scale-105 group-hover:brightness-50
        "
            />

            {/* Remove overlay */}
            <div
                className="
          absolute inset-0 grid place-items-center
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
        "
            >
                <button
                    type="button"
                    onClick={onRemove}
                    className="
            size-6 rounded-full grid place-items-center
            bg-white/90 dark:bg-black/80
            text-black dark:text-white
            transition-transform duration-150
            hover:scale-110 active:scale-90
            shadow-sm
          "
                >
                    <X className="size-3" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
