# =========================
# ETAPA 1 - BUILD DO REACT
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do projeto
COPY . .

# Gera o build de produção
RUN npm run build


# =========================
# ETAPA 2 - NGINX
# =========================
FROM nginx:alpine

# Remove configuração padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia o build do React
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Porta do container
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]