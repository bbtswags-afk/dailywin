
export const getTrueDate = async () => {
    try {
        // Use a reliable time API (TimeAPI.io or WorldTimeAPI)
        // Fallback chain to ensure reliability

        // Primary: TimeAPI.io (Clean JSON)
        try {
            const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { signal: AbortSignal.timeout(1000) });
            if (res.ok) {
                const data = await res.json();
                // data.dateTime example: "2025-01-08T22:00:00.000000"
                return new Date(data.dateTime);
            }
        } catch (e) {
            console.warn("TimeAPI failed, trying fallback...", e.message);
        }

        // Fallback: WorldTimeAPI
        try {
            const res = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC', { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                const data = await res.json();
                return new Date(data.datetime);
            }
        } catch (e) {
            console.warn("WorldTimeAPI failed...", e.message);
        }

        // Ultimate Fallback: System Time (with warning)
        console.warn("⚠️ Online Time Check Failed. Using System Time.");
        return new Date();

    } catch (e) {
        return new Date();
    }
};
