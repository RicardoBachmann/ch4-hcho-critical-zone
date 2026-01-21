async function fetchNativeLandService(productKey) {
  console.log("===NATIVE LAND-API SERVICE===");
  const nativeLandApiKey = import.meta.env.VITE_NATIVE_LAND_API_KEY;

  // API_COLLECTION object for storing and categorize different Native Land products
  const API_COLLECTION = {
    Territories: "territories",
    Languages: "languages",
  };

  const collectionId = API_COLLECTION[productKey];
  // const url = `https://native-land.ca/api/polygons/geojson/languages?key=${nativeLandApiKey}`;
  const url = `https://native-land.ca/api/polygons/geojson/${collectionId}?key=${nativeLandApiKey}`;

  if (!collectionId) {
    throw new Error(
      `Invalid product key: ${productKey}, Valid options are: ${Object.keys(API_COLLECTION).join(", ")}`
    );
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Native Land-API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw data:", data);
    return data;
  } catch (error) {
    console.error("Native Land API Error:", error);
    throw new Error(`Failed to fetch Native Land data: ${error.message}`);
  }
}

export default fetchNativeLandService;
