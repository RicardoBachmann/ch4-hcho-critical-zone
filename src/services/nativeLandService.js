async function fetchNativeLandService() {
    console.log("===NATIVE LAND-API SERVICE===")


    const nativeLandApiKey = import.meta.env.VITE_NATIVE_LAND_API_KEY;
    const url = `https://native-land.ca/api/polygons/geojson/languages?key=${nativeLandApiKey}`


    try {
        const response = await fetch(url)
        if(!response.ok) {
            throw new Error (`Native Land-API Error:, ${response.status}`)
        }
        const data = await response.json()
        console.log("Raw data:", data)
        return data

    } catch (error) {
        console.error("Native Land API Error:", error)
        throw new Error (`Failed to fetch Native Land data: ${error.message}`)
    }


}

export default fetchNativeLandService;