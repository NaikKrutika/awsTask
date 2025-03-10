exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };

    // Extract path and method
    const path = event.rawPath || event.path;
    const method = event.requestContext?.http?.method || event.httpMethod;

    // Handle GET /weather request
    if (method === "GET" && path === "/weather") {
        return {
            statusCode: 200,
            body: JSON.stringify({
                latitude: 50.4375,
                longitude: 30.5,
                generationtime_ms: 0.025033950805664062,
                utc_offset_seconds: 7200,
                timezone: "Europe/Kiev",
                timezone_abbreviation: "EET",
                elevation: 188.0,
                hourly_units: {
                    time: "iso8601",
                    temperature_2m: "°C",
                    relative_humidity_2m: "%",
                    wind_speed_10m: "km/h"
                },
                hourly: {
                    time: [
                        "2023-12-04T00:00",
                        "2023-12-04T01:00",
                        "2023-12-04T02:00",
                        "..."
                    ],
                    temperature_2m: [-2.4, -2.8, -3.2, "..."],
                    relative_humidity_2m: [84, 85, 87, "..."],
                    wind_speed_10m: [7.6, 6.8, 5.6, "..."]
                },
                current_units: {
                    time: "iso8601",
                    interval: "seconds",
                    temperature_2m: "°C",
                    wind_speed_10m: "km/h"
                },
                current: {
                    time: "2023-12-04T07:00",
                    interval: 900,
                    temperature_2m: 0.2,
                    wind_speed_10m: 10.0
                }
            }),
            headers: { "content-type": "application/json" },
            isBase64Encoded: false
        };
    } else {
        // Handle unsupported paths or methods
        return {
            statusCode: 400,
            body: JSON.stringify({
                statusCode: 400,
                message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`
            }),
            headers: { "content-type": "application/json" },
            isBase64Encoded: false
        };
    }
};
