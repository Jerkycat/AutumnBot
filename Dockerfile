# Use a imagem oficial do Node.js 18
FROM node:18

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o package.json e o yarn.lock para instalar dependências
COPY package.json yarn.lock ./

# Instale as dependências do projeto
RUN yarn install

# Copie todos os arquivos do projeto para o contêiner
COPY . .

# Compile o código
RUN yarn build

# Defina o comando padrão para rodar o bot
CMD ["yarn", "start"]
