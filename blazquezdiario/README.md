# Blazquezdiario

Tu panel de cada mañana: el día, los hábitos con sus rachas, el dinero (gastos e ingresos), los objetivos del año y los resúmenes del mes y del año.

- **Hoy**: saludo, "Tu día", Las 3 de hoy, hábitos de hoy, dinero del mes, objetivos y nota del día con tu ánimo.
- **Dinero**: control diario de gastos **e ingresos**, presupuesto, categorías, fijos mensuales, gráfico del mes y comparación con el mes anterior.
- **Hábitos**: semana para ir marcando, rachas, récords, mapa de 20 semanas y **hábitos propuestos** (forma física, empresa, descanso) que añades con un toque. También puedes crear los tuyos.
- **Objetivos**: metas del año con la marca de "dónde deberías ir hoy".
- **Resumen**: vista de **Mes** y de **Año** (ingresos y gastos por mes, ahorro acumulado, % de hábitos, mapa del año y diario).

Todo se guarda en el servidor (`data/db.json`) y cada día se hace una copia en `data/backups/` (se guardan 60 días). Desde el menú ⚙️ puedes descargar una copia completa cuando quieras.

No usa base de datos externa ni librerías: solo Node.js dentro de Docker.

---

## Subirlo al servidor (Hetzner, igual que NUBAPP)

Sin dominio: se entra por la IP y el puerto 3080 → `http://178.105.38.49:3080`

1. Sube todo el contenido de esta carpeta a un repositorio privado nuevo de GitHub (`blazquezdiario`). Nunca subas un `.env`.
2. En la consola del servidor:

```bash
cd ~
git clone https://github.com/sergioblazquez15-prog/blazquezdiario.git
cd blazquezdiario
cp .env.example .env
nano .env        # pon tu contraseña y una clave larga
mkdir -p data
docker-compose up -d --build
docker ps        # debe salir "blazquezdiario"
```

3. Si no carga desde el móvil, abre el puerto 3080 en el firewall:
   - Firewall del propio servidor: `sudo ufw allow 3080/tcp`
   - Firewall de Hetzner (en la web de Hetzner Cloud → Firewalls), si tienes uno: regla de entrada TCP 3080.

> Sin dominio no hay HTTPS: la contraseña viaja sin cifrar. Para uso personal vale; si algún día quieres el candado, se añade un subdominio y certbot en 5 minutos.

## Actualizar (cuando haya cambios)

1. Sube los archivos nuevos a GitHub (igual que en el paso 2).
2. En la consola del servidor:

```bash
cd ~/blazquezdiario
git pull
docker-compose down
docker-compose up -d --build
```

Tus datos están en `~/blazquezdiario/data` y **no se tocan** al actualizar.

## Copias de seguridad

- Automáticas: `~/blazquezdiario/data/backups/` (una por día, 60 días).
- Manual: en la app, ⚙️ → "Descargar copia de seguridad". Para restaurar, ⚙️ → "Restaurar una copia".

## Si algo falla

```bash
docker logs blazquezdiario --tail 50
```

- **"Falta APP_PASSWORD"**: el archivo `.env` no existe o está vacío (paso 3).
- **El puerto 3080 está ocupado**: cambia `127.0.0.1:3080:3080` por `127.0.0.1:3081:3080` en `docker-compose.yml` y `proxy_pass` a `3081` en el archivo de nginx.
- **nginx no arranca tras el paso 4**: `sudo nginx -t` dice qué línea falla.

## Para probarlo en local (opcional)

```bash
APP_PASSWORD=prueba node server.js
# abre http://localhost:3080
```
