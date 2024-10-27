import React, { useState } from 'react';
import { Map as MapComponent, Marker, Popup } from 'react-map-gl';
import RoomIcon from '@mui/icons-material/Room';
import 'mapbox-gl/dist/mapbox-gl.css';
import Button from '@mui/material/Button';
import './map.css';

const INITIAL_VIEWPORT = {
    latitude: 22.2483, // NIT Rourkela latitude
    longitude: 84.8315, // NIT Rourkela longitude
    zoom: 10,
};

const Map = () => {
    const [viewportState, setViewportState] = useState(INITIAL_VIEWPORT);
    const [pins, setPins] = useState([
        { id: 1, longitude: 84.8315, latitude: 22.2483, title: 'NIT Rourkela', remark: 'National Institute of Technology' },
    ]);
    
    const [activePopup, setActivePopup] = useState(null);
    const [tempPin, setTempPin] = useState(null);

    const fetchPlaceName = async (lng, lat) => {
        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoibmF5YW45NSIsImEiOiJjbTJyYXo4MXgxaTN6MmtvbWJ0emJkMHJjIn0.Ciyl4E-LjPycpha2Bfv0nw`);
            const data = await response.json();
            return data.features[0]?.place_name || "Unknown Place";
        } catch (error) {
            console.error("Error fetching place name:", error);
            return "Unknown Place";
        }
    };

    const handleMapClick = async (event) => {
        const { lng, lat } = event.lngLat;
        const placeName = await fetchPlaceName(lng, lat);
        setTempPin({ id: pins.length + 1, longitude: lng, latitude: lat, title: placeName, remark: '' });
        setActivePopup(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempPin((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPins((prev) => [...prev, tempPin]);
        setTempPin(null);
    };

    const handleMarkerClick = (marker) => {
        setViewportState({ ...viewportState, latitude: marker.latitude, longitude: marker.longitude, zoom: 12 });
        setActivePopup(marker);
    };

    const handleMarkerDelete = (id) => {
        setPins((prev) => prev.filter((marker) => marker.id !== id));
        if (activePopup && activePopup.id === id) {
            setActivePopup(null);
        }
    };

    return (
        <div className="map-container">
            
            <MapComponent
                {...viewportState}
                mapboxAccessToken="pk.eyJ1IjoibmF5YW45NSIsImEiOiJjbTJyYXo4MXgxaTN6MmtvbWJ0emJkMHJjIn0.Ciyl4E-LjPycpha2Bfv0nw"
                onMove={(event) => setViewportState(event.viewState)}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                style={{ width: '80%', height: '100vh', border:'solid red 2px'}}
                onClick={handleMapClick}
            >
                {pins.map((pin) => (
                    <Marker key={pin.id} longitude={pin.longitude} latitude={pin.latitude} anchor="bottom">
                        <RoomIcon style={{ color: 'red', fontSize: viewportState.zoom * 5 }} />
                    </Marker>
                ))}
                {activePopup && (
                    <Popup
                        latitude={activePopup.latitude}
                        longitude={activePopup.longitude}
                        closeButton={true}
                        closeOnClick={false}
                        onClose={() => setActivePopup(null)}
                        anchor="left"
                    >
                        <div>
                            <strong>{activePopup.title}</strong>
                            <p>{activePopup.remark}</p>
                        </div>
                    </Popup>
                )}
                {tempPin && (
                    <Popup
                        latitude={tempPin.latitude}
                        longitude={tempPin.longitude}
                        closeButton={true}
                        closeOnClick={false}
                        onClose={() => setTempPin(null)}
                        anchor="left"
                    >
                        <div className="popup-form">
                            <form onSubmit={handleSubmit}>
                                <label>Place:</label>
                                <p>{tempPin.title}</p>
                                <label>Remark:</label>
                                <textarea name="remark" value={tempPin.remark} onChange={handleChange} required />
                                <Button type="submit" variant="contained" color="success">
                                    Add Pin
                                </Button>
                            </form>
                        </div>
                    </Popup>
                )}
                {tempPin && (
                    <Marker longitude={tempPin.longitude} latitude={tempPin.latitude} anchor="bottom">
                        <RoomIcon style={{ color: 'blue', fontSize: viewportState.zoom * 5 }} />
                    </Marker>
                )}
            </MapComponent>
            <div className="sidebar">
                <h3>Marked Pins</h3>
                <ul className="pin-list">
                    {pins.map((pin) => (
                        <li className="pin-item" key={pin.id}>
                            <div onClick={() => handleMarkerClick(pin)}>
                                <strong>{pin.title || `Pin ${pin.id}`}</strong>
                                <p>{pin.remark}</p>
                            </div>
                            <Button onClick={() => handleMarkerDelete(pin.id)} variant="outlined" color="error">
                                Delete
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Map;
