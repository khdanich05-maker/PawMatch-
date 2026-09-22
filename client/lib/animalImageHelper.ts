// Helper ดึงรูปภาพ ป้องกันบั๊กวงเล็บปีกกาและรองรับหลายรูป
export const getAnimalImages = (imageUrl: any): string[] => {
  const fallback = "https://images.unsplash.com/photo-1543466835-00a7907e9de1";
  if (!imageUrl) return [fallback];
  if (Array.isArray(imageUrl)) {
    const list = imageUrl.filter((url) => typeof url === "string" && url.trim() !== "");
    return list.length > 0 ? list : [fallback];
  }
  if (typeof imageUrl === "string") {
    try {
      if (imageUrl.startsWith("[") && imageUrl.endsWith("]")) {
        const parsed = JSON.parse(imageUrl);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    const cleanStr = imageUrl.replace(/^\{|\}$/g, "").replace(/["']/g, "");
    const list = cleanStr.split(",").map((url) => url.trim()).filter(Boolean);
    return list.length > 0 ? list : [fallback];
  }
  return [fallback];
};