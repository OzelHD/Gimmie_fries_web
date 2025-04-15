<script lang="ts">
  import { onMount } from 'svelte';

  let loading = false;
  let results: any[] = [];
  let error: string | null = null;

  function highlightPommes(text: string): string {
    return text.replace(/(pommes)/gi, '<strong class="text-yellow-500 font-bold">$1</strong>');
  }

  async function fetchPommes() {
    console.log("🍟 Pommes Fetch Triggered!");
    loading = true;
    error = null;
    results = [];

    const FACILITY_ID_TO_NAME: Record<number, string> = {
      3: "Clausius-Bar",
      5: "Dozentenfoyer",
      7: "Food&Lab",
      8: "Archimedes",
      9: "Polyterasse",
      10: "Polysnack",
      11: "Tannenbar",
      14: "Alumni quattro Lounge",
      16: "Bistro HPI",
      17: "food market - green day",
      18: "food market - grill bbQ",
      19: "food market - pizza pasta day",
      20: "Fusion meal",
      21: "Octavo",
      23: "Dozentenfoyer 2"
    };

    try {
      const today = new Date();
      const weekday = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((weekday + 6) % 7));
      const mondayStr = monday.toISOString().split('T')[0];
      const mondayPlus14 = new Date(monday);
      mondayPlus14.setDate(monday.getDate() + 14);
      const mondayPlus14Str = mondayPlus14.toISOString().split('T')[0];

      const res = await fetch(`https://idapps.ethz.ch/cookpit-pub-services/v1/weeklyrotas?client-id=ethz-wcms&lang=de&rs-first=0&rs-size=50&valid-after=${mondayStr}&valid-before=${mondayPlus14Str}`);
      const data = await res.json();

      const todayCode = today.getDay() === 0 ? 7 : today.getDay();
      const matches: any[] = [];

      for (const rota of data['weekly-rota-array'] || []) {
        const mensa = FACILITY_ID_TO_NAME[rota['facility-id']] || `Mensa-ID ${rota['facility-id']}`;

        for (const day of rota['day-of-week-array'] || []) {
          if (day['day-of-week-code'] !== todayCode) continue;

          for (const open of day['opening-hour-array'] || []) {
            for (const mealTime of open['meal-time-array'] || []) {
              for (const line of mealTime['line-array'] || []) {
                const meal = line['meal'] || {};
                const name = meal['name']?.toLowerCase() || "";
                const description = meal['description']?.toLowerCase() || "";
                const image = meal['image-url'] || null;
                if (name.includes("pommes") || description.includes("pommes")) {
                  matches.push({
                    mensa,
                    name: meal['name'] || "",
                    description: meal['description'] || "",
                    studentPrice: meal['meal-price-array']?.[0]?.price || null,
                    image
                  });
                }
              }
            }
          }
        }
      }
      results = matches;
    } catch (err) {
      error = 'Verbindung fehlgeschlagen';
    } finally {
      loading = false;
    }
  }
</script>

<main class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-center">
  <button
    class="text-6xl p-6 rounded-full shadow-xl bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 transition-all"
    on:click={fetchPommes}
  >
    🍟
  </button>

  {#if loading}
    <p class="mt-6 text-xl text-gray-600">Suche nach <strong class="text-yellow-500 font-bold">Pommes</strong>...</p>
  {/if}

  {#if error}
    <p class="mt-6 text-xl text-red-600">{error}</p>
    <h2 class="mt-6 text-2xl font-semibold">🍟 Error...</h2>
  {/if}

  {#if results.length}
    <h2 class="mt-6 text-2xl font-semibold">🍟 Gefunden in diesen Mensas:</h2>
    <ul class="mt-4 space-y-6 w-full max-w-xl">
      {#each results as item}
        <li class="bg-white shadow-md rounded-lg p-4 text-left">
          <div class="font-bold text-lg">{item.mensa}</div>

          <div class="text-md font-semibold text-gray-800 mt-1">
            {@html highlightPommes(item.name)}
          </div>
          
          <div class="text-gray-600 text-sm mt-1">
            {@html highlightPommes(item.description)}
          </div>
          
          {#if item.studentPrice !== null}
            <div class="text-sm text-gray-800 mt-2">💰 Preis (Studierende): CHF {item.studentPrice.toFixed(2)}</div>
          {/if}
          {#if item.image}
            <img src={item.image} alt="Bild" class="mt-3 rounded-md w-full max-h-60 object-cover" />
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if !loading && !error && results.length === 0}
    <h2 class="mt-6 text-2xl font-semibold">🍟 nix <strong class="text-yellow-500 font-bold">Pommes</strong> gefunden... 🍟</h2>
  {/if}
</main>
