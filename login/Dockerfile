# Node.js 공식 이미지를 베이스 이미지로 사용합니다.
FROM node:20

# 애플리케이션 디렉토리를 생성하고 이동합니다.
WORKDIR /usr/src/app

# package.json 및 package-lock.json 파일을 복사합니다.
COPY package*.json ./

# 의존성을 설치합니다.
RUN npm install

# 애플리케이션의 나머지 코드를 복사합니다.
COPY . .

# 애플리케이션을 빌드합니다.
RUN npx webpack --config webpack.config.js

# 애플리케이션을 실행하기 위한 명령어입니다.
CMD ["node", "app.js"]

# 애플리케이션이 실행되는 포트를 노출합니다.
EXPOSE 3000