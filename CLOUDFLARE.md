# Deploy oficial na Cloudflare

Este pacote usa:

- Cloudflare Pages para HTML, CSS, JS e assets.
- Cloudflare Pages Functions para o painel administrativo.
- Cloudflare D1 como banco de dados.

## 1. Criar o banco D1

No painel Cloudflare:

1. Acesse **Workers & Pages**.
2. Abra **D1 SQL Database**.
3. Clique em **Create database**.
4. Nome: `novogen-brasil-db`.
5. Copie o `database_id`.

Depois, abra `wrangler.toml` e substitua:

```text
database_id = "SUBSTITUA_PELO_DATABASE_ID_DO_D1"
```

## 2. Criar o projeto Pages

1. Acesse **Workers & Pages**.
2. Clique em **Create application**.
3. Escolha **Pages**.
4. Use **Upload assets** para subir manualmente, ou **Import Git repository** se for usar GitHub.
5. Nome do projeto: `novogen-brasil`.
6. Pasta de publicação: raiz deste pacote.
7. Build command: deixe vazio ou use `exit 0`.
8. Build output directory: `/`.

## 3. Vincular o banco ao Pages

No projeto Pages:

1. Vá em **Settings**.
2. Abra **Functions**.
3. Em **D1 database bindings**, adicione:

```text
Variable name: DB
D1 database: novogen-brasil-db
```

## 4. Criar a senha do painel

Após o primeiro deploy, acesse:

```text
https://SEU-DOMINIO/admin/hash-password
```

Digite uma senha forte e copie o hash gerado.

Depois vá em:

1. **Settings** do projeto Pages.
2. **Environment variables**.
3. Adicione:

```text
ADMIN_USER=usuario_admin
ADMIN_PASSWORD_HASH=hash_gerado
ADMIN_SESSION_SECRET=uma_frase_aleatoria_longa_e_secreta
```

Faça um novo deploy depois de salvar as variáveis.

## 5. Rodar a migração

Na aba do banco D1, use o console SQL e execute o conteúdo de:

```text
migrations/0001_initial.sql
```

As Functions também tentam criar as tabelas automaticamente, mas executar a migração deixa o ambiente explícito e auditável.

## 6. Testes finais

1. Abra `/`.
2. Abra `/novocenter.html`.
3. Abra `/radar.html`.
4. Abra `/representantes.html`.
5. Abra `/admin/login`.
6. Entre com o usuário e senha configurados.
7. Salve uma alteração pequena no painel.
8. Recarregue o site e confirme se o conteúdo aparece.

## Observação de segurança

Após configurar `ADMIN_PASSWORD_HASH`, a rota `/admin/hash-password` passa a responder `404` automaticamente. Para reabilitar temporariamente, crie a variável:

```text
ALLOW_PASSWORD_HASH_TOOL=true
```

Remova essa variável depois de gerar o novo hash.
