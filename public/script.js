(async () => {
  const userAgent = navigator.userAgent;

  const browser = (() => {
    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.includes("OPR")) return "Opera";
    if (userAgent.includes("Brave")) return "Brave";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    return "Unknown";
  })();

  const os = (() => {
    if (userAgent.includes("Windows NT")) return "Windows";
    if (userAgent.includes("Mac OS X")) return "MacOS";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      return "iOS";
    return "Unknown";
  })();

  const device = /Mobi|Android/i.test(userAgent) ? "Mobile" : "Desktop";

  const countryCodeToName = {
    IN: "India",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    RU: "Russia",
    BR: "Brazil",
    CN: "China",
    JP: "Japan",
    KR: "South Korea",
    SG: "Singapore",
    AE: "United Arab Emirates",
  };

  const inferCountry = () => {
    const lang = navigator.language || "";
    const countryCode = lang.includes("-")
      ? lang.split("-")[1].toUpperCase()
      : null;
    return countryCodeToName[countryCode] || countryCode || "Unknown";
  };

  const analyticsData = {
    url: window.location.hostname,
    path: window.location.pathname,
    browser,
    operating_system: os,
    device,
    location: inferCountry(), // e.g. "India"
    referrer: document.referrer || "Direct",
  };

  fetch("https://backend.lalit2005.cloudflare.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analyticsData),
  }).catch((err) => console.error("Analytics error:", err));
})();
