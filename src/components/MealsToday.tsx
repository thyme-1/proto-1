import type { MealPlan } from "@/lib/dashboardTypes";
import { Card } from "@/components/Card";

export function MealsToday({ meals }: { meals: MealPlan }) {
  return (
    <Card title="Today’s Meals" className="h-full">
      <div className="grid gap-4 md:grid-cols-3">
        <MealRow label="Breakfast" value={meals.breakfast} />
        <MealRow label="Lunch" value={meals.lunch} />
        <MealRow label="Dinner" value={meals.dinner} />
      </div>
    </Card>
  );
}

function MealRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
      <div className="text-lg font-semibold text-slate-900 md:text-xl">
        {label}
      </div>
      <div className="mt-2 text-lg leading-7 text-slate-800 md:text-xl md:leading-8">
        {value}
      </div>
    </div>
  );
}

