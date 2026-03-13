import React, { useEffect, useState } from "react";
import { getFlag } from "@/helpers/getFlag";
import styles from "@/styles/flag.module.css";
import { FlagProps } from "@/types/types";
import clsx from "clsx";

const Flag: React.FC<FlagProps> = (props) => {
  const {
    countryCode,
    label,
    customSelect,
    direction,
    flagBaseUrl,
    className,
    size = "md",
  } = props;
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [countryCode, flagBaseUrl]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const altText = label ?? countryCode?.toUpperCase() ?? "??";

  return (
    <div
      data-component="flag"
      className={clsx(
        styles["flag-wrap"],
        customSelect && styles["custom-select"],
        size === "sm" && styles["flag-sm"],
        direction === "rtl" && styles["rtl"],
        className
      )}
    >
      {hasError ? (
        <div
          className={styles.flag}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
            fontSize: "10px",
            color: "#666",
          }}
        >
          {altText}
        </div>
      ) : (
        <img
          alt={altText}
          src={getFlag(countryCode, flagBaseUrl)}
          className={clsx(styles.flag, !isLoaded && styles["flag-loading"])}
          loading="eager"
          decoding="async"
          draggable={false}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            display: "block",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      )}
    </div>
  );
};

export default React.memo(Flag, (prevProps, nextProps) => {
  // Only re-render if countryCode actually changed (most important prop)
  if (prevProps.countryCode !== nextProps.countryCode) {
    return false; // Re-render
  }

  return (
    prevProps.countryCode === nextProps.countryCode &&
    prevProps.label === nextProps.label &&
    prevProps.customSelect === nextProps.customSelect &&
    prevProps.direction === nextProps.direction &&
    prevProps.flagBaseUrl === nextProps.flagBaseUrl &&
    prevProps.className === nextProps.className &&
    prevProps.size === nextProps.size
  );
});
