import app from "./app.js"
import { env } from "./config/env.js"


const desiredPort = env.port ?? 1234

app.listen(desiredPort, () => {
    console.log(`Servidor corriendo en http://localhost:${env.port}`);

})