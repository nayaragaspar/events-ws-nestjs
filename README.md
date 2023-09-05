# SCA

## Getting started

API para gerenciamento de assembléas e controle de entrada de público.
WebSocket para exibição em tempo real da quantidade de cada tipo de participantes do evento para validação de quórum.

## Install

Para rodar a aplicação localmente:

- Configurar variáveis de ambiente do projeto para apontar para o banco de dados desejado.
- Executar os comandos:

```
npm install
```

```
npm start dev
```

Para executar com Docker:

```
docker build --tag <image_name> .
```

```
docker run -d <container_id>
```

## As rotas da API estão relacionadas na collection do Postman na pasta 'postman' do projeto
