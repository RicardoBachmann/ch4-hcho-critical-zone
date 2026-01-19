import { useRef, useEffect } from "react";
import "./App.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  // Map instance
  const mapRef = useRef();
  // Map container html-el
  const mapContainerRef = useRef();
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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
        data: "/Indigenous_Territories.geojson",
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
