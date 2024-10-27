# Concurrent Transactions

Uma aplicação simples de transferências entre contas para demonstrar transações concorrentes em um sistema de alta disponibilidade

## Sumário

- [Configurando o projeto](#project-setup)
  1. [Configurando Variáveis de Ambiente](#1-configurando-variáveis-de-ambiente)
  2. [Instalando dependências](#2-instalando-dependências)
  3. [Configurando o banco de dados](#3-configurando-o-banco-de-dados)
  4. [Executando o projeto](#4-executando-o-projeto)
- [Usando o projeto](#usando-o-projeto)
- [Executando testes](#executando-testes)

## Configurando o projeto

### 1. Configurando Variáveis de Ambiente

Antes de executar este projeto pela primeira vez, você precisará de uma instância do **PostgreSQL** com um banco de dados vazio funcionando

Para configurar o projeto para usar esta instância, você pode criar uma cópia do arquivo [**.env.example**](/.env.example), nomeando-a **.env**

Dentro deste arquivo, há uma única variável de ambiente chamada DATABASE_URL. Substitua seu valor pelas credenciais de seu banco de dados:

```shell
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/testdatabase"
```

Não se preocupe, _este arquivo **.env** não será incluído ao commitar as alterações com o git_

### 2. Instalando dependências

Execute um dos comandos a seguir no shell na pasta raiz deste projeto:

```bash
# Instalar todas as dependências
$ npm install
# ou
$ npm i

# Instalação de produção
# (menor, não afeta o package-lock.json)
$ npm ci
```

### 3. Configurando o banco de dados

Existem alguns comandos predefinidos que ajudam a configurar seu banco de dados, executar ou redefinir as _migrations_, assim como gerar uma nova _migration_ e _schema_ durante o desenvolvimento

```bash
# Executa todas as migrations
$ npm run migration:run

# Esvazia o banco de dados e reaplica todas as migrations
$ npm run migration:reset:dev

# Cria uma nova migration. Substitua <migration_name> pelo nome desejado
$ npm run migration:create <migration_name>
```

### 4. Executando o projeto

Após configurar tudo, execute `npm run start` para rodar o projeto em modo de desenvolvimento. Ou use uma das opções de execução:

```bash
# modo de desenvolvimento
$ npm run start

# modo de desenvolvimento com "watch" (atualiza quando mudanças no código são salvas)
$ npm run start:dev

# modo de produção
$ npm run start:prod
```

## Usando o projeto

As rotas e funções disponíveis são, a seguir:

| Método | Rota               | Descrição                                         |
| ------ | ------------------ | ------------------------------------------------- |
| POST   | `/contas`          | Cria nova Conta                                   |
| GET    | `/contas`          | Lista Contas                                      |
| GET    | `/contas/{numero}` | Encontrar uma Conta                               |
| DELETE | `/contas/{numero}` | Apagar Conta (para propósitos de desenvolvimento) |
| POST   | `/transacoes`      | Faz uma Transação                                 |
| GET    | `/transacoes`      | Lista Transações                                  |
| GET    | `/transacoes/{id}` | Encontrar uma Transação                           |

## Executando testes

```bash
# testes unitários
$ npm run test

# testes end-to-end
$ npm run test:e2e

# testes com cobertura
$ npm run test:cov
```
