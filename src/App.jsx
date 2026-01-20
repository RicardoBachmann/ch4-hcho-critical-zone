import { useRef, useEffect, useState } from "react";
import "./App.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import fetchNativeLandService from "./services/nativeLandService";

function App() {
  // Map instance
  const mapRef = useRef();
  // Map container html-el
  const mapContainerRef = useRef();
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const [indigenousLand, setIndigenousLand] = useState([]);

  useEffect(() => {
    async function loadData() {
      const result = await fetchNativeLandService();
      setIndigenousLand(result);
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
          "fill-color": "#088",
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
    mapRef.current.on("load", () => {
      mapRef.current.addSource("nativland", {
        type: "geojson",
        data: indigenousLand,
      });

      mapRef.current.addLayer({
        id: "nativeland-layer",
        type: "fill",
        source: "nativland",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });
    });

    return () => {
      mapRef.current.remove();
    };
  });

  return (
    <>
      <h1>Critical Zone</h1>
      <h3>geo-social conflicts</h3>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
