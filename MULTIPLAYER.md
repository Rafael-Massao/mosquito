# Multiplayer cooperativo

O jogo agora tem salas de até **4 jogadores**, com código de 6 caracteres. O menu **Multijogador cooperativo** permite criar uma sala ou entrar na sala de um amigo. O modo solo continua disponível.

## O que é compartilhado

- Posição, direção, nome, skin, Atos do Tusk e crescimento das partes de cada mosquito.
- Porta da Sala 3: se alguém já a desbloqueou ou resolver a senha, ela abre para a equipe.
- Vida, fases, alvo e ataques do chefe. No online, os golpes atingem a área indicada pelo aviso; saiam dela antes do ataque.
- Vitória contra o chefe: quem participou da luta e continua conectado recebe a conquista e a skin. Recompensas já obtidas não são pagas novamente.

Cada jogador mantém seu próprio sangue, upgrades, inventário, missões e conquistas no navegador. NPCs comuns, coletas, potes e tinta continuam individuais nesta primeira versão. Não há combate entre jogadores.

Abrir menus pausa o seu mosquito, mas a sala continua para os amigos. O chefe não ataca jogadores em menus ou com a aba oculta. Se a conexão cair, o jogo volta ao modo solo; entre novamente com o código. Salas vazias ficam disponíveis por até 90 segundos. O servidor mantém as salas em memória: reiniciá-lo encerra as sessões, sem apagar os saves dos navegadores.

## Hospedar na internet

**Enviar arquivos ao GitHub não coloca o servidor online.** GitHub Pages e hospedagens que só servem HTML não executam este servidor WebSocket. Use uma hospedagem com Node.js e WebSocket.

Uma opção é o Render; o repositório já inclui `render.yaml`:

1. Entre em sua conta no Render e escolha **New → Blueprint**.
2. Conecte o repositório `Rafael-Massao/mobile-test`. Ele pode continuar privado; autorize o acesso na integração com o GitHub.
3. Escolha a branch `main`, confira o serviço e o plano disponível na sua conta e confirme a criação.
4. O serviço instala com `npm ci` e inicia com `npm start`. Após a publicação, abra o endereço HTTPS informado pelo Render.
5. Compartilhe esse endereço com os amigos. No jogo, abra **Multijogador cooperativo → Criar sala** e envie o código. Os amigos usam **Entrar com código**.

O servidor entrega o site e a conexão online pelo mesmo endereço; nesse caso, deixe o campo **Endereço do servidor** em branco. Serviços gratuitos podem suspender quando ficam ociosos e demorar para iniciar; aguarde o serviço acordar e tente conectar novamente.

Se preferir manter o site em outra hospedagem, atualize `index.html`, `script.js`, `multiplayer.js` e `multiplayer.css`, mantendo o `style.css` atual. No menu online, informe a URL HTTPS do servidor. Todos precisam usar o mesmo servidor para encontrar o código da sala.

Os arquivos de áudio e ícones originais, se usados, devem continuar nas pastas `sound/` e `icons/`. Eles não são adicionados por esta atualização.

## Executar no computador

Instale Node.js 20 ou superior. Na pasta do projeto:

```sh
npm ci
npm start
```

Abra `http://localhost:3000`. Na mesma rede Wi-Fi, outro dispositivo pode abrir `http://IP-DO-COMPUTADOR:3000`, se o firewall permitir. Para jogar pela internet, publique o serviço como descrito acima.

## Configuração e testes

- `PORT`: porta HTTP/WebSocket; padrão `3000`. A hospedagem normalmente fornece esse valor.
- `ALLOWED_ORIGINS`: opcional, lista de origens permitidas separadas por vírgula, por exemplo `https://meu-jogo.onrender.com,https://meu-site.example`. Se definida, inclua todos os sites que devem conectar.
- Endpoint WebSocket: `/online`. Verificação de funcionamento: `/health`.
- Use uma única instância do servidor nesta versão: as salas ficam na memória dessa instância.
- O servidor valida os dados básicos, limita mensagens e não aceita dano enviado diretamente por jogadores. É um cooperativo casual, sem contas e sem proteção completa contra clientes modificados.

```sh
npm test
```

Os testes verificam lotação e isolamento das salas, entrada/saída, limites de dados, combate compartilhado, recompensas, pausa, arquivos públicos e comunicação WebSocket real.
