FROM jamma/node
MAINTAINER Jeff YU, jeff@jamma.cn
COPY . .
RUN yarn --prod && yarn cache clean
