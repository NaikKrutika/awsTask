const axios = require("axios");
const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({ region: "eu-central-1" });
const TABLE_NAME = process.env.TARGET_TABLE || "Weather";

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    const path = event?.rawPath || "/";
    const method = event?.requestContext?.http?.method || "GET";
    const id = event?.queryStringParameters?.id;

    if (method === "GET" && path === "/weather") {
        try {

            if (id) {
                const getParams = {
                    TableName: TABLE_NAME,
                    Key: { id: { S: id } },
                };

                const { Item } = await client.send(new GetItemCommand(getParams));

                if (Item) {
                    console.log("Data found in DynamoDB:", Item);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            id: Item.id.S,
                            forecast: JSON.parse(Item.forecast.S),
                        }),
                        headers: { "content-type": "application/json" },
                    };
                }
            }

            // Fetch new weather data if ID not provided or not found
            const response = await axios.get(
                "https://api.open-meteo.com/v1/forecast?latitude=50.4375&longitude=30.5&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&current_weather=true"
            );

            const weatherData = response.data;
            const newId = uuidv4();


            const putParams = {
                TableName: TABLE_NAME,
                Item: {
                    id: { S: newId },
                    forecast: { S: JSON.stringify(weatherData) },
                },
            };

            await client.send(new PutItemCommand(putParams));

            return {
                statusCode: 200,
                body: JSON.stringify({ id: newId, forecast: weatherData }),
                headers: { "content-type": "application/json" },
            };

        } catch (error) {
            console.error("Error fetching or storing weather data:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Internal Server Error" }),
                headers: { "content-type": "application/json" },
            };
        }
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`,
            }),
            headers: { "content-type": "application/json" },
        };
    }
};
