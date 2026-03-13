const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8082';

/**
 * Trigger SOS alert with user's location
 */
export const triggerSos = async (email, token, sosData) => {
    const response = await fetch(`${BASE_URL}/api/sos/trigger?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sosData),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send SOS');
    }

    return await response.text();
};

/**
 * Get all SOS alerts (Admin)
 */
export const getAllSosAlerts = async (adminEmail, token) => {
    const response = await fetch(`${BASE_URL}/api/sos/all?adminEmail=${encodeURIComponent(adminEmail)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch SOS alerts');
    }

    return await response.json();
};

/**
 * Get active SOS alerts (Admin)
 */
export const getActiveSosAlerts = async (adminEmail, token) => {
    const response = await fetch(`${BASE_URL}/api/sos/active?adminEmail=${encodeURIComponent(adminEmail)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch active SOS alerts');
    }

    return await response.json();
};

/**
 * Resolve an SOS alert (Admin)
 */
export const resolveSosAlert = async (alertId, adminEmail, token) => {
    const response = await fetch(
        `${BASE_URL}/api/sos/resolve/${alertId}?adminEmail=${encodeURIComponent(adminEmail)}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to resolve SOS alert');
    }

    return await response.text();
};

/**
 * Get active SOS alert count (Admin)
 */
export const getActiveSosCount = async (adminEmail, token) => {
    const response = await fetch(
        `${BASE_URL}/api/sos/active-count?adminEmail=${encodeURIComponent(adminEmail)}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        return 0;
    }

    return await response.json();
};
