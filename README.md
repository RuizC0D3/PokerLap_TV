# PokerLap TV
-Pantalla de TV para torneos de poker, con tablero de nivel, reloj, jugadores, premios y modo QR para vincular cada TV con el backend de PokerLap.
​
# Requisitos
-Node.js 18+ y npm 9+ (o pnpm/yarn si prefieres).
​-Acceso al WebSocket de PokerLap configurado en src/services/ws.ts.

# Instalación
-Clonar el repositorio:

-bash
-git clone <https://github.com/RuizC0D3/PokerLap_TV>
-cd pokerlap-tv

Instalar dependencias (ejemplo con npm):
-bash
-npm install

Si usas pnpm:
-bash
-pnpm install

# Desarrollo
Levantar el servidor de desarrollo:
-bash
-npm run dev

Luego abrir en el navegador:
http://localhost:5173

Modo edición de layout
Para editar posiciones de los widgets en la grilla:
http://localhost:5173/?edit=1

Arrastra cada card para moverla en la grilla.​

El rectángulo amarillo muestra el área donde caerá el widget, respetando su tamaño.​

Build para producción
Generar build:
-bash
-npm run build

Servir el build localmente (ejemplo con npm):
-bash
-npm run preview
-En producción, sirve la carpeta dist/ con tu servidor estático preferido (Nginx, S3, etc.).

# Configuración de TV / QR
Al iniciar, la app se conecta al WebSocket de PokerLap definido en createTvSocket.

Si el servidor envía un mensaje de tipo QR, se muestra la pantalla de activación con un código QR.

El QR tiene formato pokerlap://ax56<ID_TV> para enlazar la TV con la app móvil.


# Tecnologías
-React + TypeScript.
-Vite como bundler / dev server.
-WebSockets para actualizar estado del torneo en tiempo real.
-qrcode.react para la generación del código QR.
-Layout manual con CSS-in-JS (inline styles) y grilla lógica de 32×18 celdas.

# Estructura principal
-src/App.tsx: lógica principal de TV, layout y drag & drop en modo edición.
-src/tournamentState.ts: tipos y utilidades para el estado del torneo (TournamentState, recalcTimeLeftFromEstado).
-src/services/ws.ts: creación y manejo del WebSocket (createTvSocket).
​
# Derechos y licencia
Este software y su diseño visual están desarrollados para ROCAS y PokerLap.

Todos los derechos sobre marca, logos, artes y diseño de la interfaz pertenecen a ROCAS o a sus respectivos propietarios.

No se permite la redistribución, uso comercial o modificación de este proyecto sin autorización expresa por escrito de ROCAS.