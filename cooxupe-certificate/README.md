# Instruções para atualização do certificado digital

Esse README.md possui instruções para atualização do certificado digital WildCard da Cooxupé no projeto Cxp-Psc-Sync.

<br>

    # Para a aplicação reconhecer o certificado digital, os arquivos devem estar no seguinte diretório no servidor NODE[DSV,HO,PRD]:

    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ ls -lh
      total 20K
      -rw-rw-r-- 1 node node 3.3K Dec 14 16:17 CABundle.crt
      -rw-rw-r-- 1 node node 2.4K Nov 16 09:24 domain.crt
      -rw-rw-r-- 1 node node 1.9K Nov 16 09:25 intermediate.crt
      -rw-rw-r-- 1 node node 1.7K Dec 23 14:23 myserver.key
      -rw-rw-r-- 1 node node 1.4K Nov 16 09:24 root.crt

    # Como esse certificado é renovado anualmente, é necessário atualizar com o novo certificado sempre antes que expire.

    # Para verificar a data de expiração, consultar o time de infraestrutura.

<br>

    # O certificado "myserver.key" por default é criptografado. Porém a aplicação exige que esse certificado seja descriptografado.

    # Para gerar o certificado "myserver.key" sem criptografia é necessário seguir os passos abaixo:

    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ openssl rsa -in myserver.key -out myserver_sem_senha.key

    # Logo em seguida, excluir e certificado criptografado e renomear o certificado descriptografado para "myserver.key".
    
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ rm -f myserver.key
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ mv myserver_sem_senha.key myserver.key

<br>

    # Certificado que o certificado "CABundle.crt" tenha o certificado "root.crt" e o certificado "intermediate.crt".

<br>

    # Para o novo certificado digital ter efeito, é necessário buildar novamente a NodeJS.

    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 list
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 delete 0
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 delete 1
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 list
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ npm run build
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 start /u01/cxp-psc-sync/dist/main.js --interpreter /usr/local/bin/node –time
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 start /u01/cxp-psc-sync/dist/sync.js --interpreter /usr/local/bin/node --time
    > node@nodedsv:/u01/cxp-psc-sync/cooxupe-certificate$ pm2 status

<br>

    # Após a atualização do certificado digital, é necessário atualizar o certificado digital WildCard da Cooxupé no projeto Cxp-Psc-Sync no GitLabCxp.

## Observação

<br>

    # Esse README.md foi desenvolvido de uma perspectiva de atualização do certificado, não de implementação.

<br>

    # Favor atualizá-lo caso tenha alguma informação que não ficou clara ou esteja faltando.