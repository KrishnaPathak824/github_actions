from node:20 as BUILD

WORKDIR /App

COPY . .

RUN yarn install 

RUN yarn build


from nginx:1.27.5-alpine as PROD

COPY --from=BUILD /App/dist /var/www/html/

COPY --from=BUILD /App/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



