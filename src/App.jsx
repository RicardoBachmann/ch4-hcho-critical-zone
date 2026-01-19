import { useRef, useState, useEffect } from "react";
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
