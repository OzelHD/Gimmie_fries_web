import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

const FACILITY_ID_TO_NAME: Record<number, string> = {
  3:  "Clausius-Bar",
  5:  "Dozentenfoyer",
  7:  "Food&Lab",
  8:  "Archimedes",
  9:  "Polyterasse",
  10: "Polysnack",
  11: "Tannenbar",
  14: "Alumni quattro Lounge",
  16: "Bistro HPI",
  17: "food market - green day",
  18: "food market - grill bbQ",
  19: "food market - pizza pasta day",
  20: "Fusion meal",
  21: "Octavo"
};

function get_valid_dates(today: Date): [string, string] {
  const weekday = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((weekday + 6) % 7));
  const monday_next_next_week = new Date(monday);
  monday_next_next_week.setDate(monday.getDate() + 14);
  return [
    monday.toISOString().split('T')[0],
    monday_next_next_week.toISOString().split('T')[0]
  ];
}

export const GET: RequestHandler = async () => {
  const today = new Date();
  const [valid_after, valid_before] = get_valid_dates(today);
  const today_code = today.getDay() === 0 ? 7 : today.getDay(); // Sonntag fixen

  const response = await fetch(
    `https://idapps.ethz.ch/cookpit-pub-services/v1/weeklyrotas?client-id=ethz-wcms&lang=de&rs-first=0&rs-size=50&valid-after=${valid_after}&valid-before=${valid_before}`,
    {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'de-DE,de;q=0.9'
      }
    }
  );

  if (!response.ok) {
    return json({ error: 'Fehler beim Abrufen der Daten' }, { status: 500 });
  }

  const data = await response.json();
  const results: any[] = [];

  for (const rota of data['weekly-rota-array'] || []) {
    const facilityId = rota['facility-id'];
    const mensaName = FACILITY_ID_TO_NAME[facilityId] || `Mensa-ID ${facilityId}`;

    for (const day of rota['day-of-week-array'] || []) {
      if (day['day-of-week-code'] !== today_code) continue;

      for (const opening of day['opening-hour-array'] || []) {
        for (const mealTime of opening['meal-time-array'] || []) {
          for (const line of mealTime['line-array'] || []) {
            const meal = line['meal'];
            if (!meal) continue;

            const name = meal['name'] || '';
            const description = meal['description'] || '';
            const prices = meal['meal-price-array'] || [];
            const image = meal['picture-url'] || null;

            const studentPriceObj = prices.find((p: any) => p['customer-group-code'] === 10);
            const studentPrice = studentPriceObj ? studentPriceObj['price'] : null;

            if (name.toLowerCase().includes('pommes') || description.toLowerCase().includes('pommes')) {
              results.push({
                mensa: mensaName,
                name,
                description,
                studentPrice,
                image
              });
            }
          }
        }
      }
    }
  }

  return json(results);
};
