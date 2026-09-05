// Hardcoded price lookup, standing in for a real product catalog / database.
const CATALOG: Record<string, number> = {
  "widget-small": 9.99,
  "widget-medium": 19.99,
  "widget-large": 29.99,
  "gadget-basic": 49.99,
  "gadget-pro": 99.99,
};

export function getPriceForItem(itemId: string): number | undefined {
  return CATALOG[itemId];
}
