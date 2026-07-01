export type Greeting = "Good morning" | "Good afternoon" | "Good evening";

export function getGreeting(now: Date = new Date()): Greeting {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
