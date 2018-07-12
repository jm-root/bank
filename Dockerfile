FROM jamma/node
MAINTAINER Jeff YU, jeff@jamma.cn
COPY . .
RUN yarn global add lerna
RUN lerna bootstrap
