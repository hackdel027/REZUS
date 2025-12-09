const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "OPTI-RH API",
        contact: {
            name: "Opti-RH Support",
            email: "jarrdelm027@gmail.com",
        },
        version: "1.0.0",
        description: "Application de gestion des ressources humaines",
    },
};

const options = {
    swaggerDefinition,
    apis: ["./routes/*.js"], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;