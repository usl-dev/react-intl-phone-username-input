import { memo, useState, useEffect, useRef } from "react";
import styles from "@/styles/flag.module.css";
import { FlagProps } from "@/types/types";
import clsx from "clsx";
import { getFlag } from "@/helpers/getFlag";

const LazyFlag: React.FC<FlagProps> = memo((props) => {
  const {
    countryCode,
    label,
    customSelect,
    direction,
    flagBaseUrl,
    className,
    size = "md",
  } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const flagSrc = getFlag(countryCode, flagBaseUrl);
  const altText = label ?? "Flag";

  useEffect(() => {
    const currentImg = imgRef.current;
    if (!currentImg) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            break;
          }
        }
      },
      { rootMargin: "50px", threshold: 0.1 }
    );

    observer.observe(currentImg);
    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setIsLoaded(true); // Still set loaded to avoid infinite loading state
  };

  return (
    <div
      className={clsx(
        styles["flag-wrap"],
        customSelect && styles["custom-select"],
        size === "sm" && styles["flag-sm"],
        direction === "rtl" && styles["rtl"],
        className
      )}
    >
      <img
        ref={imgRef}
        alt={altText}
        src={
          isVisible
            ? flagSrc
            : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
        } // Transparent placeholder
        className={clsx(styles.flag, !isLoaded && styles["flag-loading"])}
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
});

LazyFlag.displayName = "LazyFlag";

export default LazyFlag;
