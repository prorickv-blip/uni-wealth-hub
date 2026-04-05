import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSettings {
  wallet_address: string;
  airtel_merchant_id: string;
  airtel_dial_code: string;
  platform_name: string;
  logo_url: string;
  icon_url: string;
  loading: boolean;
}

const defaults: PlatformSettings = {
  wallet_address: "TH7aGzdMyxViEjo7nk7aRdkr6U171r8m12",
  airtel_merchant_id: "7055987",
  airtel_dial_code: "*185*9#",
  platform_name: "UNI",
  logo_url: "",
  icon_url: "",
  loading: true,
};

export function usePlatformSettings(): PlatformSettings {
  const [settings, setSettings] = useState<PlatformSettings>(defaults);

  useEffect(() => {
    supabase.from("platform_settings").select("*").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        for (const s of data) map[s.key] = s.value;
        const newIconUrl = map.icon_url || "";
        setSettings({
          wallet_address: map.wallet_address || defaults.wallet_address,
          airtel_merchant_id: map.airtel_merchant_id || defaults.airtel_merchant_id,
          airtel_dial_code: map.airtel_dial_code || defaults.airtel_dial_code,
          platform_name: map.platform_name || defaults.platform_name,
          logo_url: map.logo_url || "",
          icon_url: newIconUrl,
          loading: false,
        });
        // Dynamically update favicon
        if (newIconUrl) {
          const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
          if (link) link.href = newIconUrl;
        }
      } else {
        setSettings(prev => ({ ...prev, loading: false }));
      }
    });
  }, []);

  return settings;
}
