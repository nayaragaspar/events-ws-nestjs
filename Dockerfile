FROM node:18.13.0-alpine3.17
WORKDIR /u01/sca/sca-backend
RUN chmod -R 777 /u01/sca/sca-backend
ENV LD_LIBRARY_PATH=/lib

# Instalação do Oracle Client
RUN apk --no-cache add libaio libnsl libc6-compat curl && \
    cd /tmp && \
    curl -o instantclient-basiclite.zip https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip -SL && \
    unzip instantclient-basiclite.zip && \
    mv instantclient*/ /usr/lib/instantclient && \
    rm instantclient-basiclite.zip && \
    ln -s /usr/lib/instantclient/libclntsh.so.19.1 /usr/lib/libclntsh.so && \
    ln -s /usr/lib/instantclient/libocci.so.19.1 /usr/lib/libocci.so && \
    ln -s /usr/lib/instantclient/libociicus.so /usr/lib/libociicus.so && \
    ln -s /usr/lib/instantclient/libnnz19.so /usr/lib/libnnz19.so && \
    ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
    ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2 && \
    ln -s /lib64/ld-linux-x86-64.so.2 /usr/lib/ld-linux-x86-64.so.2

ENV ORACLE_BASE /usr/lib/instantclient
ENV LD_LIBRARY_PATH /usr/lib/instantclient
ENV TNS_ADMIN /usr/lib/instantclient
ENV ORACLE_HOME /usr/lib/instantclient
RUN apk add dumb-init

#RUN adduser /bin/bash docker-sca

#USER docker-sca

RUN mkdir ~/.npm-global
RUN npm config set prefix '~/.npm-global'
RUN echo export PATH=~/.npm-global/bin:$PATH > ~/.profile
RUN source ~/.profile


RUN npm cache clean --force

RUN npm install -g npm@9.2.0
COPY . .
EXPOSE 3020

RUN npm config rm proxy
RUN npm install
RUN  npm run build --prod
CMD ["npm", "start"]
