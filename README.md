# Gestor de gastos personales

Estructura base del proyecto. Los archivos todavía no contienen la implementación.

## Arquitectura inicial

```text
src/
|-- configuracion/
|   `-- baseDeDatos.js
|-- controladores/
|   `-- gastoControlador.js
|-- modelos/
|   `-- gastoModelo.js
|-- rutas/
|   `-- gastoRutas.js
|-- vistas/
|   `-- README.md
`-- servidor.js
```

`servidor.js` configura Express, conecta MongoDB y monta las rutas en `/api/gastos`. El frontend se definirá más adelante.
