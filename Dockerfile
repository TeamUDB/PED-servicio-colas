# Usa una imagen de Node.js como base
FROM node:18

# Establece el directorio de trabajo en /usr/src/app
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

RUN npx prisma generate

# Expone el puerto 3000 (o el puerto que utilice tu aplicación)
EXPOSE 3000

# Comando para ejecutar la aplicación cuando se inicie el contenedor
CMD ["node", "index.js"]
