import { useRef, useEffect, useState } from "react";
import "./App.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import fetchNativeLandService from "./services/nativeLandService.js";
import { fetchClimateTraceService } from "./services/climateTraceService.js";
import { fetchClimateTraceAssets } from "./services/climateTraceService.js";

function App() {
  // Map instance
  const mapRef = useRef();
  // Map container html-el
  const mapContainerRef = useRef();
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const [territoriesData, setTerritoriesData] = useState(null);
  const [languagesData, setLanguagesData] = useState(null);
  const [landUseData, setLandUseData] = useState(null); // All forestry-and-land-use
  const [assetData, setAssetData] = useState(null); // Emission assets for reservoirs

  const [activeTerritoriesLayer, setActiveTerritoriesLayer] = useState(false);
  const [activeIndigenousBorders, setActiveIndigenousBorders] = useState(false);
  const [activeLanguagesLayer, setActiveLanguagesLayer] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const territories = await fetchNativeLandService("Territories"); // TODO: Add proxy ?
        setTerritoriesData(territories);
        console.log("Territories loaded:", territories);
      } catch (error) {
        console.error("Territories faild:", error);
      }
      try {
        const languages = await fetchNativeLandService("Languages");
        setLanguagesData(languages);
        console.log("Languages loaded:", languages);
      } catch (error) {
        console.error("Languages failed:", error);
      }
    }
    loadData();
  }, []);

  // Total Reservior Emissions (monthly 01-12/2024)
  useEffect(() => {
    async function loadData() {
      try {
        const landUseEmissions = await fetchClimateTraceService();
        setLandUseData(landUseEmissions);
        console.log("Land use Emission loaded:", landUseEmissions);
        const reservoirEmissions = landUseEmissions.filter(
          (reservoirs) => reservoirs.subsector === "water-reservoirs"
        );
        console.log("Reservoir-emissions data:", reservoirEmissions);
      } catch (error) {
        console.error("Emission Data failed:", error);
      }
    }
    loadData();
  }, []);

  // Load Emission Assets (detail data resources for ch4-emissions-reservoirs-2024)
  useEffect(() => {
    async function loadAssets() {
      try {
        const assets = await fetchClimateTraceAssets();
        setAssetData(assets);
        console.log("Assets loaded:", assets);
      } catch (error) {
        console.error("Assets failed:", error);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      // Initial view: Amazon region
      center: [-60.17795, -6.82434],
      zoom: 5,
      style: "mapbox://styles/mapbox/satellite-v9",
    });

    mapRef.current.on("load", () => {
      mapRef.current.addSource("indigenous", {
        type: "geojson",
        data: "https://pub-49eaf3cf9daf4701a7e62bff979c1f65.r2.dev/Indigenous_Territories.geojson",
      });

      mapRef.current.addLayer({
        id: "indigenous-layer",
        type: "fill",
        source: "indigenous",
        paint: {
          "fill-color": "#4131be",
          "fill-opacity": 0.5,
        },
      });

      mapRef.current.addLayer({
        id: "indigenous-outline",
        type: "line",
        source: "indigenous",
        paint: {
          "line-color": "#fb0000",
          "line-width": 0.5,
        },
      });
    });
  }, [accessToken]);

  // indigenous raisg borders toggle
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapRef.current.getSource("indigenous")) return;

    if (activeIndigenousBorders) {
      mapRef.current.setLayoutProperty(
        "indigenous-layer",
        "visibility",
        "visible"
      );
    } else {
      mapRef.current.setLayoutProperty(
        "indigenous-layer",
        "visibility",
        "none"
      );
    }
  }, [activeIndigenousBorders]);

  useEffect(() => {
    console.log("MapRef:", mapRef);
    console.log("Territories data:", territoriesData);
    console.log("Languages data:", languagesData);

    if (!mapRef.current) {
      return;
    }

    // Territories Layer
    // Load Native Land data (Territories currently blocked by CORS)
    if (territoriesData && !mapRef.current.getSource("territories")) {
      mapRef.current.addSource("territories", {
        type: "geojson",
        data: territoriesData,
      });
      mapRef.current.addLayer({
        id: "native-land-territories-layer",
        type: "fill",
        source: "territories",
        paint: {
          "fill-color": "#4e9138",
          "fill-opacity": 0.5,
        },
      });
    }

    // Languages Layer
    if (languagesData && !mapRef.current.getSource("languages")) {
      mapRef.current.addSource("languages", {
        type: "geojson",
        data: languagesData,
      });
      mapRef.current.addLayer({
        id: "native-land-languages-layer",
        type: "fill",
        source: "languages",
        paint: {
          "fill-color": "#eb710e",
          "fill-opacity": 0.5,
        },
      });
    }
  }, [territoriesData, languagesData]);

  // Native Land & Language Layer Toggle
  useEffect(() => {
    const layerConfigs = [
      { id: "native-land-territories-layer", isActive: activeTerritoriesLayer },
      { id: "native-land-languages-layer", isActive: activeLanguagesLayer },
    ];

    layerConfigs.forEach((layer) => {
      if (!mapRef.current) return;
      if (!mapRef.current.getLayer(layer.id)) return;
      if (layer.isActive) {
        mapRef.current.setLayoutProperty(layer.id, "visibility", "visible");
      } else {
        mapRef.current.setLayoutProperty(layer.id, "visibility", "none");
      }
    });
  }, [activeTerritoriesLayer, activeLanguagesLayer]);

  // Critical 50 Dams Layer (GDW-Data)
  useEffect(() => {
    mapRef.current.on("load", () => {
      mapRef.current.addSource("critical-dam", {
        type: "geojson",
        data: "/data/Critical_Dams_TOP50(GDW).geojson",
      });

      mapRef.current.addLayer({
        id: "critical-dam-layer",
        type: "circle",
        source: "critical-dam",
        paint: {
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-color": "red",
          "circle-stroke-color": "white",
        },
      });
    });
  }, []);

  // UHE & PCH Dams Layer (Raisg-Data)
  useEffect(() => {
    mapRef.current.on("load", () => {
      mapRef.current.addSource("uhe-pch-dams", {
        type: "geojson",
        data: "/data/UHE_PCH_Dam_Locations(Raisg).geojson",
      });

      mapRef.current.addLayer({
        id: "uhe-pch-dam-layer",
        type: "circle",
        slot: "middle",
        source: "uhe-pch-dams",
        paint: {
          "circle-radius": 5,
          "circle-color": [
            "match",
            ["get", "tipo"],
            "UHE",
            "red",
            "PCH",
            "#3bb2d0",
            "#f135c5",
          ],
          "circle-stroke-color": "white",
        },
      });
    });
  }, []);

  // Climate TRACE Format -> Geojson Format
  const parseToGeoJSON = (assets) => {
    return {
      type: "FeatureCollection",
      features: assets.map((asset) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [asset.centroid.longitude, asset.centroid.latitude],
        },
        properties: {
          name: asset.name,
          emissions: asset.emissionsQuantity,
        },
      })),
    };
  };

  // Display Climate TRACE emissions assets
  useEffect(() => {
    if (!mapRef.current || !assetData) return;

    const geojsonData = parseToGeoJSON(assetData);

    // (idle) Wait until Style is REALLY finished
    mapRef.current.once("idle", () => {
      if (!mapRef.current.getSource("emissions-assets-data")) {
        mapRef.current.addSource("emissions-assets-data", {
          type: "geojson",
          data: geojsonData,
        });

        mapRef.current.addLayer({
          id: "emission-location-layer",
          type: "circle",
          source: "emissions-assets-data",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "emissions"],
              300,
              3, // 300t CH4 = 3px
              14000,
              30, // 14000t CH4 = 20px
            ],
            "circle-color": "#223b53",
            "circle-stroke-color": "yellow",
            "circle-stroke-width": 1,
            "circle-opacity": 0.5,
          },
        });
      }
    });
  }, [assetData]);

  useEffect(() => {
    if (!mapRef.current || !assetData) return;

    // base pop-up for better map navigation
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    mapRef.current.addInteraction("emissions-location-mouseenter", {
      type: "mouseenter",
      target: { layerId: "emission-location-layer" },
      handler: (e) => {
        mapRef.current.getCanvas().style.cursor = "pointer";

        const coordinates = e.feature.geometry.coordinates.slice();
        const damName = e.feature.properties.name;
        const emissions = e.feature.properties.emissions;

        popup
          .setLngLat(coordinates)

          .setHTML(
            `<strong>${damName}</strong><p>CH4-Emissions:${emissions.toFixed(1)}t</p>`
          )
          .addTo(mapRef.current);
      },
    });
    mapRef.current.addInteraction("emissions-location-mouseleave", {
      type: "mouseleave",
      target: { layerId: "emission-location-layer" },
      handler: () => {
        mapRef.current.getCanvas().style.cursor = "";
        popup.remove();
      },
    });

    return () => {
      mapRef.current?.removeInteraction("emissions-location-mouseenter");
      mapRef.current?.removeInteraction("emissions-location-mouseleave");
    };
  }, [assetData]);

  // Global Water Surface WMTS
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.once("idle", () => {
      if (!mapRef.current.getSource("gws-water-extent")) {
        mapRef.current.addSource("gws-water-extent", {
          type: "raster",
          tiles: [
            "https://storage.googleapis.com/global-surface-water/tiles2021/change/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
        });
        mapRef.current.addLayer({
          id: "gws-water-extent-layer",
          type: "raster",
          source: "gws-water-extent",
          paint: {},
          slot: "middle",
        });
      }
    });

    return () => {
      if (mapRef.current) {
        if (mapRef.current.getLayer("gws-water-extent-layer")) {
          mapRef.current.removeLayer("gws-water-extent-layer");
        }
        if (mapRef.current.getSource("gws-water-extent")) {
          mapRef.current.removeSource("gws-water-extent");
        }
      }
    };
  }, []);

  // GEE Integration CH4 Critical Hotspots (SEP2024) samples
  useEffect(() => {
    mapRef.current.on("load", () => {
      mapRef.current.addSource("ch4-hotspot-samples", {
        type: "geojson",
        data: "/data/ch4_samples_export.geojson",
      });
      mapRef.current.addLayer({
        id: "ch4-hotspot-layer",
        type: "circle",
        source: "ch4-hotspot-samples",
        paint: {
          "circle-radius": 20,
          "circle-color": "transparent",
          "circle-stroke-width": 2,
          "circle-stroke-color": "orange",
        },
      });
    });
  }, []);

  // GEE Integration HCHO Critical Hotspots (SEP2024) samples

  useEffect(() => {
    mapRef.current.on("load", () => {
      mapRef.current.addSource("hcho-hotspots-samples", {
        type: "geojson",
        data: "/data/hcho_samples_export.geojson",
      });

      mapRef.current.addLayer({
        id: "hcho_hotspots_layer",
        type: "circle",
        source: "hcho-hotspots-samples",
        paint: {
          "circle-radius": 20,
          "circle-color": "transparent",
          "circle-stroke-width": 2,
          "circle-stroke-color": "purple",
        },
      });
    });
  }, []);

  return (
    <>
      <h1>Critical Zone</h1>
      <h3>geo-social conflicts</h3>
      <button
        onClick={() => {
          setActiveTerritoriesLayer(!activeTerritoriesLayer);
        }}
        style={{
          backgroundColor: activeTerritoriesLayer ? "#4e9138" : "#ccc",
          border: activeTerritoriesLayer ? "2px solid #000" : "none",
        }}
      >
        Territories
      </button>
      <button
        onClick={() => {
          setActiveIndigenousBorders(!activeIndigenousBorders);
        }}
        style={{
          backgroundColor: activeIndigenousBorders ? "#4e9138" : "#ccc",
          border: activeIndigenousBorders ? "2px solid #000" : "none",
        }}
      >
        Indigenous Borders
      </button>
      <button
        onClick={() => {
          setActiveLanguagesLayer(!activeLanguagesLayer);
        }}
        style={{
          backgroundColor: activeLanguagesLayer ? "#4e9138" : "#ccc",
          border: activeLanguagesLayer ? "2px solid #000" : "none",
        }}
      >
        Languages
      </button>

      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
