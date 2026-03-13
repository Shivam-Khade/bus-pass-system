import { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';
import { triggerSos } from '../api/sos';
import './SOSButton.css';

const SOSButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const user = getCurrentUser();

    const getLocation = () => {
        setFetchingLocation(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setFetchingLocation(false);
            },
            (error) => {
                let errMsg = 'Unable to get your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errMsg += 'Please enable location permissions.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errMsg += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errMsg += 'Location request timed out.';
                        break;
                    default:
                        errMsg += 'An unknown error occurred.';
                }
                setLocationError(errMsg);
                setFetchingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const handleOpenSos = () => {
        setShowModal(true);
        setSuccess(false);
        setMessage('');
        setLocation(null);
        setLocationError('');
        getLocation();
    };

    const handleSendSos = async () => {
        if (!location) return;

        setLoading(true);
        try {
            await triggerSos(user.email, user.token, {
                latitude: location.latitude,
                longitude: location.longitude,
                message: message || 'Emergency! I need help!',
            });
            setSuccess(true);
        } catch (error) {
            alert('Failed to send SOS: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setSuccess(false);
        setMessage('');
        setLocation(null);
        setLocationError('');
    };

    // Only show for authenticated users (not admin)
    if (!user || user.role === 'ADMIN') return null;

    return (
        <>
            {/* Floating SOS Button */}
            <div className="sos-floating-btn">
                <button className="sos-trigger-btn" onClick={handleOpenSos} title="Emergency SOS">
                    🚨 SOS
                </button>
            </div>

            {/* SOS Modal */}
            {showModal && (
                <div className="sos-modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && handleClose()}>
                    <div className="sos-modal">
                        {!success ? (
                            <>
                                <div className="sos-modal-header">
                                    <div className="sos-icon">🚨</div>
                                    <div>
                                        <h2>Emergency SOS</h2>
                                        <p>Send an emergency alert to admin</p>
                                    </div>
                                </div>

                                {/* Location Status */}
                                {fetchingLocation && (
                                    <div className="sos-loading-location">
                                        <div className="loc-spinner"></div>
                                        <p>Getting your location...</p>
                                    </div>
                                )}

                                {location && (
                                    <div className="sos-location-info">
                                        <span className="loc-icon">📍</span>
                                        <div className="loc-text">
                                            <strong>Location captured</strong>
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </div>
                                    </div>
                                )}

                                {locationError && (
                                    <div className="sos-location-error">
                                        <span>⚠️</span>
                                        {locationError}
                                    </div>
                                )}

                                {/* Message Input */}
                                <textarea
                                    className="sos-message-input"
                                    placeholder="Describe your emergency (optional)..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={500}
                                />

                                {/* Action Buttons */}
                                <div className="sos-modal-actions">
                                    <button className="sos-cancel-btn" onClick={handleClose} disabled={loading}>
                                        Cancel
                                    </button>
                                    <button
                                        className="sos-send-btn"
                                        onClick={handleSendSos}
                                        disabled={!location || loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="sos-spinner"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            '🚨 Send SOS Alert'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="sos-success">
                                <div className="success-icon">✓</div>
                                <h3>SOS Alert Sent!</h3>
                                <p>
                                    Admin has been notified of your emergency.
                                    <br />
                                    Help is on the way. Stay safe!
                                </p>
                                <button className="sos-done-btn" onClick={handleClose}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SOSButton;
