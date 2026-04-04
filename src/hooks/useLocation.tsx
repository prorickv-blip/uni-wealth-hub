import { useState, useEffect } from "react";

interface LocationInfo {
  country: string;
  countryCode: string;
  isUganda: boolean;
  currency: "USD" | "UGX";
  loading: boolean;
}

export function useLocation(): LocationInfo {
  const [info, setInfo] = useState<LocationInfo>({
    country: "",
    countryCode: "",
    isUganda: false,
    currency: "USD",
    loading: true,
  });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const isUG = data.country_code === "UG";
        setInfo({
          country: data.country_name || "",
          countryCode: data.country_code || "",
          isUganda: isUG,
          currency: isUG ? "UGX" : "USD",
          loading: false,
        });
      })
      .catch(() => {
        setInfo((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  return info;
}
