# Segurança da aplicação

Revisão aplicada em 29/09/2026 em resposta à análise externa concluída em 25/09/2026.

## Controles aplicados no projeto

- CSRF por token de 256 bits e cookie `SameSite=Lax`, `Secure` e `HttpOnly` no login, logout e gravação do CMS.
- Validação estrita do cabeçalho `Origin` em todas as operações administrativas que alteram estado.
- CORS aberto removido das respostas. A aplicação não expõe API para consumo entre origens.
- Redirects administrativos e de compatibilidade retornam resposta HTTP com corpo vazio.
- CSP por resposta, com nonce criptograficamente aleatório, `strict-dynamic`, restrição de frames, objetos, formulários e conexões.
- Cookies de sessão assinados, com expiração, `Secure`, `HttpOnly` e `SameSite=Lax`.
- Limite e bloqueio temporário de tentativas de login, além de auditoria em D1.

## Cabeçalhos geridos pela infraestrutura

Por orientação da TI, estes cabeçalhos não são configurados no projeto e devem permanecer na borda da Cloudflare:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`

O projeto mantém `frame-ancestors 'self'` na CSP, pois essa diretiva faz parte da política da aplicação e não cria valores conflitantes para `X-Frame-Options`.

## SRI e scripts de terceiros

Os scripts do Google Analytics e do widget CEPEA são endpoints dinâmicos, atualizados pelos próprios fornecedores. Um hash SRI fixo deixaria de corresponder quando o fornecedor atualizasse o conteúdo e interromperia a funcionalidade.

O risco é mitigado por CSP com nonce único por resposta e `strict-dynamic`: somente scripts autorizados pela página e scripts carregados por eles podem executar. Recursos estáticos locais são servidos pela mesma origem e não dependem de SRI.

## Validação após publicação

Confirmar no domínio de produção:

1. Ausência de `Access-Control-Allow-Origin: *`.
2. Presença de `Content-Security-Policy` com nonce variável entre respostas.
3. Redirects com `Content-Length: 0` ou sem corpo.
4. Login sem token, origem inválida ou cookie ausente retornando `403`.
5. HSTS, `nosniff` e `X-Frame-Options` presentes somente com os valores definidos pela TI na borda.
