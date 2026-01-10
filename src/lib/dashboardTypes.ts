export type MealPlan = {
  breakfast: string;
  lunch: string;
  dinner: string;
};

export type DashboardEvent = {
  /**
   * Stable id so admins can edit/delete reliably.
   * (In a future DB, this becomes a document/row id.)
   */
  id: string;
  /**
   * Local date string in YYYY-MM-DD.
   * Keeping it as a simple string avoids timezone confusion.
   */
  date: string;
  /**
   * 24h time in HH:MM (local facility time).
   */
  time: string;
  title: string;
  location?: string;
  description?: string;
};

export type DashboardPhoto = {
  url: string;
  alt: string;
};

export type DashboardData = {
  meals: MealPlan;
  events: DashboardEvent[];
  photos: DashboardPhoto[];
  updatedAt?: string;
};

