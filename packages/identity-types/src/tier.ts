export const Tier = ['anonymous', 'authenticated', 'creator', 'partner', 'staff'] as const;
export type Tier = (typeof Tier)[number];

const order: Record<Tier, number> = {
  anonymous: 0,
  authenticated: 1,
  creator: 2,
  partner: 3,
  staff: 4,
};

/** at-least: returns true when `actual` >= `required`. */
export function tierAtLeast(actual: Tier, required: Tier): boolean {
  return order[actual] >= order[required];
}
