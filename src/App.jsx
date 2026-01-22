import { useRef, useEffect, useState } from "react";
import "./App.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import fetchNativeLandService from "./services/nativeLandService.js";

function App() {
  // Map instance
  const mapRef = useRef();
  // Map container html-el
  const mapContainerRef = useRef();
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const [territoriesData, setTerritoriesData] = useState(null);
  const [languagesData, setLanguagesData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const territories = await fetchNativeLandService("Territories"); // TODO: Add proxy
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
          "line-color": "#000",
          "line-width": 0.5,
        },
      });
    });

    return () => {
      mapRef.current.remove();
    };
  }, [accessToken]);

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

  return (
    <>
      <h1>Critical Zone</h1>
      <h3>geo-social conflicts</h3>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
