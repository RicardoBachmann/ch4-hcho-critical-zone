export async function fetchClimateTraceService() {
  console.log("===CLIMATE TRACE API===");
  const response = await fetch(
    "https://api.c10e.org/v7/app/country/download/json?" +
      "country=BRA&" +
      "sector=forestry-and-land-use&" +
      "subsector=water-reservoirs&" +
      "gas=ch4&" +
      "start=2024&" +
      "end=2024&" +
      "timeGranularity=month"
  );
  const data = await response.json();

  return data;
}
