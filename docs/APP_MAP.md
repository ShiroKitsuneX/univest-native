# Univest - Mapa Completo do Produto, Fluxos e Funcionalidades

## Objetivo deste documento

Este arquivo é o mapa funcional mais completo do Univest dentro deste repositório.
Ele deve servir para:

- orientar desenvolvedores humanos
- orientar ferramentas de IA com pouco contexto
- registrar o que o app já faz hoje
- registrar o que já está parcialmente preparado
- registrar o que ainda está planejado para o futuro
- evitar perda de contexto sobre regras, fluxos e escopo do produto

Sempre que uma funcionalidade for criada, alterada, removida ou redefinida, este documento deve ser atualizado.

---

## Legenda de status

- **Implementado**: já existe no app atual
- **Parcial**: existe em alguma forma, mas ainda incompleto, simplificado ou com arquitetura temporária
- **Planejado**: ainda não existe de forma final no app, mas já faz parte da direção do produto

---

## Visão geral do produto

O Univest é um aplicativo de acompanhamento da jornada acadêmica.
Ele cobre desde ensino médio e técnico até graduação, mestrado, doutorado e educação continuada.
O foco principal atual do produto é ajudar o usuário a:

- descobrir universidades e cursos
- acompanhar vestibulares, ENEM e processos seletivos
- seguir instituições e receber atualizações no feed
- comparar seu desempenho com notas de corte
- organizar metas acadêmicas
- acompanhar livros obrigatórios, provas e eventos
- montar um perfil acadêmico com preferências, localização e objetivo de curso

Além da experiência para usuários comuns, o app já possui uma base inicial para **contas institucionais**, onde universidades podem administrar suas próprias informações.

---

## Inventário atual de catálogos e dados seedados

### Perfis acadêmicos suportados no onboarding
**Implementado**

O app reconhece hoje 11 perfis de usuário:

1. Ensino Médio
2. Ensino Médio Técnico
3. Pré-vestibulando
4. Foco no ENEM
5. Graduando
6. Pré-mestrado
7. Mestrando
8. Pré-doutorado
9. Doutorando
10. Pós-doutorando
11. Educação Continuada

Esses perfis definem o contexto do usuário dentro do app e aparecem no perfil.

### Áreas de descoberta de cursos
**Implementado**

O modal de descoberta de cursos trabalha hoje com 7 áreas:

1. Saúde
2. Exatas
3. Tecnologia
4. Humanas
5. Negócios
6. Artes & Design
7. Agrárias

Essas áreas somam atualmente **39 cursos seedados** no catálogo local.

### Catálogo inicial de instituições
**Implementado / Parcial**

O catálogo local atual possui **21 entradas principais**, incluindo:

- ENEM como entidade nacional
- universidades estaduais
- universidades federais
- instituições técnicas

Distribuição atual:

- 1 entidade nacional
- 4 estaduais
- 14 federais
- 2 técnicas

### Conteúdos seedados de apoio
**Implementado / Parcial**

O app também possui conteúdo local de fallback para não depender 100% do Firebase:

- 14 registros de notas de corte
- 4 eventos acadêmicos seedados
- 5 posts seedados de feed
- 27 estados brasileiros
- 250 cidades seedadas
- 18 instituições com livros obrigatórios seedados
- 4 instituições com provas/listas de exames seedadas
- 13 entradas totais de provas dentro do catálogo local atual

Isso significa que parte importante da experiência já funciona com fallback local, mesmo quando o backend não retorna dados completos.

---

## Tipos de conta

## 1. Conta de usuário comum
**Implementado**

É a conta padrão criada via cadastro por e-mail e senha.

Essa conta:

- passa pelo onboarding
- escolhe perfil acadêmico
- escolhe cursos de interesse
- segue universidades
- usa as 4 abas principais
- salva posts
- registra notas
- define localização
- escolhe universidades-meta
- acompanha livros, provas e tarefas

## 2. Conta institucional
**Implementado / Parcial**

Uma conta institucional é identificada por:

- `tipo: "instituicao"` no documento do usuário
- `linkedUniId` apontando para a universidade vinculada

Essa conta:

- não passa pelo onboarding comum
- cai direto no app principal
- troca a aba `Perfil` por uma tela administrativa da instituição
- pode editar campos da universidade vinculada

Ainda faltam vários recursos institucionais planejados, mas a base já existe.

---

## Fluxo global do app

## 1. Bootstrap inicial
**Implementado**

Ao abrir o app, o fluxo atual é:

1. carregar dados locais salvos em AsyncStorage
2. hidratar stores com dados locais já conhecidos
3. iniciar listener de autenticação do Firebase
4. buscar documento do usuário em `usuarios/{uid}`
5. hidratar stores com dados remotos
6. carregar cursos, ícones, localização geográfica e universidades
7. carregar posts e likes do usuário autenticado
8. decidir se o usuário verá `Welcome`, `Onboarding` ou `Main`

### O que é carregado no bootstrap

- autenticação do usuário
- dados do onboarding
- perfil do usuário
- progresso de livros e tarefas
- posts salvos
- universidades
- cursos/ícones
- geografia
- likes do feed

### Regras importantes do bootstrap

- se não houver usuário autenticado, o app vai para `Welcome`
- se houver usuário comum e `done !== true`, o app vai para `Onboarding`
- se for conta institucional, o onboarding é pulado
- enquanto hidrata e autentica, o app mostra `SplashScreen`

---

## 2. Fluxo de autenticação

## Tela de boas-vindas
**Implementado**

A tela inicial apresenta:

- marca UniVest
- slogan: portal inteligente para toda a jornada acadêmica
- lista de áreas macro do produto
- botão principal `Entrar ou criar conta`

### Destaques visuais mostrados na home

Hoje a tela comunica visualmente estes blocos:

- Vestibulares & ENEM
- Graduação & Pós-graduação
- Mestrado & Doutorado
- Ensino Médio & Técnico
- Cursos e outros

## Modal de autenticação
**Implementado**

Ao tocar no CTA principal, abre um modal com 3 subfluxos:

1. login
2. criação de conta
3. recuperação de senha

### Login
**Implementado**

Campos:

- e-mail
- senha

Comportamentos:

- valida preenchimento mínimo
- permite mostrar/ocultar senha
- traduz erros comuns do Firebase para mensagens amigáveis

### Cadastro
**Implementado**

Campos:

- e-mail
- nome
- sobrenome
- senha
- confirmar senha
- data de nascimento
- aceite dos Termos e Condições

Regras atuais:

- nome é obrigatório
- sobrenome é obrigatório no fluxo atual de UI
- senha passa por validação mínima
- confirmação de senha deve coincidir
- data precisa estar em formato válido `DD/MM/AAAA`
- aceite dos termos é obrigatório

Ao cadastrar:

- a conta Firebase Auth é criada
- o documento `usuarios/{uid}` é criado
- o usuário recebe e-mail de verificação
- o usuário entra na categoria `tipo: "usuario"`
- `done` inicia como `false`

### Recuperação de senha
**Implementado**

Fluxo:

- usuário informa o e-mail
- o app chama envio de link de redefinição
- se tudo der certo, aparece confirmação de e-mail enviado

## Termos e Condições
**Implementado / Parcial**

Hoje existe:

- modal dedicado com o texto dos termos
- botão `Aceitar`
- botão `Recusar`
- retorno automático ao fluxo de cadastro

Limitações atuais:

- o texto ainda é estático no app
- não existe versão dinâmica vinda do banco
- não existe política de aceite por versão
- não existe reaceite obrigatório após mudança

---

## 3. Fluxo de onboarding do usuário comum
**Implementado / Parcial**

O onboarding atual possui 3 etapas.

## Etapa 1 - Perfil acadêmico
**Implementado**

Pergunta principal:

- `O que melhor descreve você?`

O usuário escolhe 1 dos 11 perfis acadêmicos disponíveis.

Impacto dessa escolha:

- o perfil aparece depois na aba `Perfil`
- o contexto do usuário fica salvo como parte do documento de onboarding
- esse dado personaliza a leitura futura do app, mesmo que ainda não condicione tudo visualmente

## Etapa 2 - Cursos de interesse
**Implementado**

O usuário escolhe:

- 1ª opção de curso (`c1`)
- 2ª opção opcional (`c2`)

Funcionalidades atuais:

- busca textual de cursos
- seleção alternada entre 1ª e 2ª opção
- limpeza rápida das escolhas
- uso de catálogo vindo do Firebase quando disponível
- fallback para catálogo local quando necessário

Esses dados alimentam depois:

- análises da aba `Notas`
- objetivo principal do perfil
- comparações com notas de corte

## Etapa 3 - Universidades para seguir
**Implementado**

O usuário escolhe universidades que deseja seguir já no onboarding.

Funcionalidades atuais:

- busca por universidade
- alternância seguir/deixar de seguir
- salvamento do conjunto seguido
- personalização inicial do feed

Ao concluir o onboarding:

- `done` vira `true`
- são persistidos `uTypeId`, `c1`, `c2` e `followedUnis`
- o usuário entra no app principal

## Observação arquitetural importante
**Parcial**

Embora exista store para o onboarding, a tela ainda faz persistência remota direta do término em Firestore. Isso funciona, mas é uma dívida técnica que deve ser migrada para a arquitetura final de service/repository.

---

## 4. Estrutura principal do app autenticado

## Navegação principal
**Implementado**

O app principal é organizado em 4 abas:

1. Feed
2. Explorar
3. Notas
4. Perfil

### Rotas atuais reais

- `Welcome`
- `Onboarding`
- `Main`

Dentro de `Main`:

- `FeedTab`
- `ExplorarTab`
- `NotasTab`
- `PerfilTab`

Dentro de `ExplorarTab`:

- `UniversityList`
- `UniversityDetail`
- `ExamsList`
- `BooksList`
- `Following`

## Cabeçalho por aba
**Implementado**

- Feed: mostra avatar do usuário
- Explorar: mostra subtítulo de descoberta universitária
- Notas: mostra subtítulo de notas de corte e provas
- Perfil: mostra botão de configurações

## Modais globais orquestrados no app principal
**Implementado**

Hoje o app principal abre estes modais:

- `SettingsModal`
- `AvatarPickerModal`
- `EditNameModal`
- `EditCoursesModal`
- `EventDetailModal`
- `AddGradeModal`
- `ShareModal`
- `DiscoverCoursesModal`
- `UniSortModal`
- `ExamDetailModal`
- `LocationSettingsModal`
- `GoalsModal`
- `SavedPostsModal`

Esses modais compõem parte essencial da experiência e não são acessórios; muitas funcionalidades só existem por eles.

---

## Feed

## Objetivo da aba Feed

Centralizar novidades de universidades seguidas e conteúdo acadêmico relevante.

## Stories de universidades
**Implementado / Parcial**

O topo do feed usa um strip de stories.

### Comportamento atual

- stories são agrupados por universidade
- aparecem primeiro os grupos com story mais recente
- o anel da story muda conforme visualização
- stories são carregados a partir das universidades seguidas
- se houver poucas stories e o usuário seguir universidades, aparece CTA `Seguir`

### Viewer de stories
**Implementado**

Ao abrir um grupo de stories:

- a primeira story abre em tela cheia
- existe progress bar por story
- o avanço é automático
- toque no lado esquerdo volta
- toque no lado direito avança
- swipe horizontal navega entre stories
- swipe para baixo fecha
- a visualização marca a story como vista
- a visualização incrementa `viewsCount` remotamente

### Modelo atual das stories
**Implementado / Parcial**

Cada story contém hoje:

- universidade dona
- cor da universidade
- imagem
- possível vídeo no modelo de dados
- data de criação
- data de expiração
- contador de views

### Estado atual do recurso

- usuário comum consome stories
- backend de stories já existe
- instituição ainda não tem fluxo completo de publicação dentro da UI

## Contagem regressiva de provas
**Implementado**

O feed exibe um bloco `Contagem regressiva` quando existem universidades-meta com provas futuras.

O card mostra:

- universidade
- cor/identidade visual da universidade
- quantidade de dias restantes
- nome da prova

Ao tocar:

- o usuário navega para o detalhe da universidade correspondente

## Lista principal de posts
**Implementado / Parcial**

O feed carrega posts do Firebase, com fallback para dados locais.

### Tipos de conteúdo vistos hoje

- inscrições
- lista de obras
- notas de corte
- simulados
- notícias

### Cada card de post mostra

- universidade de origem
- tempo relativo ou timestamp vindo do backend
- tag visual por tipo
- título
- descrição/corpo
- contadores de curtidas e compartilhamentos

## Interações do post
**Implementado**

### Curtir

- exige usuário autenticado
- faz update otimista
- atualiza contador local imediatamente
- persiste like no Firebase

### Compartilhar

- abre modal de compartilhamento
- incrementa contador de share localmente
- dispara incremento remoto de shares

### Reportar

- abre confirmação
- cria report no Firebase
- salva motivo padrão `user_report`

### Salvar

- alterna estado salvo local do usuário
- os posts salvos aparecem no perfil/modal de salvos

## Estado vazio do feed
**Implementado**

Quando não há posts e nem universidades seguidas:

- o app mostra empty state
- incentiva o usuário a explorar universidades

---

## Explorar

## Objetivo da aba Explorar

Permitir descoberta, filtro e navegação por instituições, cursos e vestibulares.

## Personalização por destino de estudos
**Implementado**

Se o usuário ainda não definiu onde quer estudar:

- aparece um card de CTA para abrir configuração de localização
- isso alimenta filtros da aba Explorar

## Entrada para descoberta de cursos
**Implementado**

Existe um card em destaque:

- `Ainda não sabe qual curso?`
- abre `DiscoverCoursesModal`

## Busca de universidades
**Implementado**

A busca atual considera:

- nome curto da instituição
- nome completo
- cidade
- sigla do estado
- nome do estado
- cursos oferecidos pela instituição
- comparação sem acentos

## Filtros por estado
**Implementado**

A aba possui chips horizontais com:

- `Todos`
- estado-alvo do usuário com destaque `🎯`
- demais estados válidos encontrados no catálogo

## Lista de universidades
**Implementado**

Cada card mostra:

- avatar textual da instituição
- nome
- cidade e estado
- contagem de seguidores formatada
- destaque visual se a universidade já é seguida

Ao tocar:

- navega para `UniversityDetail`

## UniversityDetail
**Implementado / Parcial**

A tela de detalhe da universidade concentra hoje:

- botão de voltar
- header com cor institucional
- nome e nome completo
- descrição
- ação de seguir/deixar de seguir
- contagem de seguidores
- acesso à lista de provas anteriores, quando houver
- card do próximo vestibular
- lista de cursos da instituição
- lista de livros obrigatórios
- link para site oficial

## Seguir universidade
**Implementado / Parcial**

O follow/unfollow faz hoje:

- update otimista da lista de universidades
- update otimista da universidade selecionada
- update do `followedUnis` no estado do usuário
- persistência em `usuarios/{uid}`
- tentativa de incremento/decremento de seguidores em `universidades/{uniId}`

Isso personaliza:

- feed
- stories
- lista `Seguindo`

## Livros obrigatórios dentro da universidade
**Implementado**

Cada livro pode estar em 3 estados:

- nenhum
- lendo
- lido

O usuário toca no item e escolhe o estado.

Isso alimenta:

- progresso de leitura geral
- tarefas de metas
- resumo de livros na aba `Perfil`

## Lista de provas (`ExamsList`)
**Implementado / Parcial**

Quando a universidade tem provas seedadas, o usuário acessa uma tela específica.

### Funcionalidades atuais

- ordenação por mais recente ou mais antigo
- busca por assunto/fase
- separação entre provas futuras e passadas
- agrupamento por ano nas provas passadas
- expansão/retração por ano
- badge de PDF quando existe

### Provas futuras

Mostram:

- assunto
- fase
- quantidade de questões
- selo `Em breve`

### Provas passadas

Mostram:

- assunto
- fase
- quantidade de questões
- duração
- indicador de PDF

Ao tocar em qualquer prova, abre `ExamDetailModal`.

## Modal de detalhes de prova
**Implementado**

### Para prova futura

Mostra:

- assunto
- ano
- fase
- data prevista
- duração
- número de questões
- link do site oficial

### Para prova passada

Mostra:

- data
- duração
- número de questões
- descrição da prova
- botão para site oficial
- botão para PDF quando disponível

## Lista global de livros (`BooksList`)
**Implementado**

A partir do perfil, o usuário pode abrir a lista consolidada de livros.

Funcionalidades atuais:

- busca por nome do livro ou universidade
- contagem de livros lidos e em leitura
- alteração rápida de status
- visualização consolidada de todos os livros do ecossistema seguido/seedado

## Lista de universidades seguidas (`Following`)
**Implementado**

A tela `Seguindo` mostra:

- todas as universidades marcadas como seguidas
- ordenação coerente com a configuração atual de ordenação
- empty state com CTA para explorar quando necessário

---

## Notas

## Objetivo da aba Notas

Concentrar desempenho acadêmico do usuário, histórico de provas/simulados e comparação com notas de corte.

## Resumo do objetivo atual
**Implementado**

No topo da aba `Notas`, o app mostra:

- 1ª opção de curso
- 2ª opção de curso, se existir
- CTA para editar cursos
- mensagem contextual dizendo que as análises abaixo usam essas escolhas

## Notas de corte
**Implementado / Parcial**

O bloco de notas de corte permite:

- buscar por curso ou universidade
- usar automaticamente `c1` e `c2` quando não há busca manual
- listar notas de corte seedadas
- abrir site oficial de cada entrada

Cada card mostra:

- curso
- universidade
- vagas
- nota de corte
- diferença entre a última média do usuário e a nota de corte
- barra visual proporcional

## Minhas notas
**Implementado**

O usuário pode adicionar notas pelo modal `AddGradeModal`.

### Campos da nota

- nome da prova
- mês/ano
- tipo: `prova` ou `simulado`
- Linguagens
- Humanas
- Natureza
- Matemática
- Redação

### O que acontece ao salvar

- cria um item na lista de notas do perfil
- a nota entra imediatamente nas análises visuais
- o modal reseta seus campos

## Filtros de notas
**Implementado**

A aba permite filtrar:

- todas
- provas
- simulados

## Empty state da aba
**Implementado**

Se não existir nenhuma nota compatível com o filtro:

- o app mostra mensagem de estado vazio
- orienta o usuário a adicionar notas

## Insight de área fraca
**Implementado**

Quando existe pelo menos uma nota:

- o app calcula a menor área da última prova
- destaca a disciplina com menor desempenho
- exibe card de atenção com score correspondente

## Evolução por área
**Implementado / Parcial**

Existe visualização de evolução com gráfico de barras.

O dataset considera:

- Linguagens
- Humanas
- Natureza
- Matemática

Observação importante:

- Redação existe no modelo de dados e no comparativo, mas não entra nesse gráfico específico

## Comparativo `Você vs Meta`
**Implementado / Parcial**

O app monta uma comparação por área entre:

- desempenho da última nota
- meta baseada na maior nota de corte do curso principal (`c1`)

Cada linha mostra:

- nome da área
- meta
- score atual
- percentual relativo
- indicador visual de acima/abaixo

## Modo comparar no histórico
**Implementado / Parcial**

No bloco `Histórico`, o usuário pode ligar o modo `Comparar`.

Quando ativo:

- o app compara a média da última nota com as 5 primeiras notas de corte do curso principal
- mostra para cada universidade se o usuário `passa` ou `não passa`
- exibe diferença em pontos

## Histórico de provas
**Implementado**

Cada item do histórico mostra:

- tipo visual: prova ou simulado
- nome do exame
- data
- notas por área
- média resumida
- botão para excluir a entrada

---

## Perfil do usuário comum

## Objetivo da aba Perfil

Reunir identidade do usuário, progresso, metas, tarefas, livros, universidades seguidas, salvos e eventos.

## Cabeçalho do perfil
**Implementado**

O card principal mostra:

- foto/emoji do avatar
- cor de fundo do avatar
- nome e sobrenome editáveis
- perfil acadêmico selecionado no onboarding
- 1ª e 2ª opção de curso
- localização atual
- destino de estudos
- estatísticas rápidas

## Estatísticas do topo
**Implementado**

O perfil mostra hoje:

- número de universidades seguidas
- número de provas registradas
- número de simulados registrados
- número de posts salvos

Atalhos embutidos:

- tocar em `seguindo` abre a lista de seguidas
- tocar em `salvos` abre o modal de salvos

## Card `Meu Objetivo`
**Implementado**

Mostra:

- curso principal
- nota de corte alvo estimada
- segunda opção, se existir
- média mais recente do usuário
- percentual da meta já alcançado

Se o usuário não possui notas:

- aparece CTA para ir para a aba `Notas`

## Resumo de livros
**Implementado**

O perfil resume o progresso de leitura com base em `readBooks`.

Estados resumidos:

- quantidade de livros em leitura
- quantidade de livros lidos
- CTA para abrir lista completa de livros

## Sistema de metas e tarefas
**Implementado / Parcial**

Este é um dos recursos mais importantes do app atual.

### Conceito atual

Existe uma separação entre:

- universidades que o usuário segue
- universidades que o usuário pretende fazer vestibular

As universidades-meta são geridas no `GoalsModal` e ficam em `goalsUnis`.

### O que o usuário faz no modal de metas

- busca universidade
- seleciona ou remove universidades-meta
- visualiza vestibular e próxima prova da instituição
- salva o conjunto de metas

### Como as tarefas são geradas hoje

Para cada universidade-meta, o app cria automaticamente:

- tarefas de leitura de livros obrigatórios
- tarefa `Fazer inscrição`
- tarefa `Pagar taxa de inscrição`

### Estados de tarefa

- livro em branco
- livro em leitura
- livro lido
- tarefa comum concluída ou não concluída

### O bloco visual do perfil mostra para cada meta

- universidade
- vestibular associado
- contador de dias para a próxima prova, quando existir
- checklist de tarefas
- percentual concluído
- contador `x/y tarefas`

Ao tocar na universidade-meta:

- o usuário navega para o detalhe da universidade

## Provas das suas metas
**Implementado**

Quando existem provas futuras nas universidades-meta:

- o perfil mostra um card com até 5 provas futuras
- cada item exibe data, universidade, fase e contagem regressiva em dias

## Próximos eventos
**Implementado / Parcial**

O perfil exibe eventos acadêmicos seedados.

Cada evento mostra:

- data destacada
- nome do evento
- instituição associada

Ao tocar:

- abre `EventDetailModal`

## Modal de evento
**Implementado**

Mostra:

- título do evento
- instituição/fonte
- resumo descritivo
- botão para site oficial

---

## Configurações e modais do usuário

## SettingsModal
**Implementado**

Centraliza configurações gerais do usuário.

### Tema

O usuário pode escolher:

- escuro
- claro
- automático

### Conta

Entradas disponíveis hoje:

- nome
- alterar foto de perfil
- editar opções de curso
- localização
- metas de vestibular
- e-mail
- sair

## AvatarPickerModal
**Implementado**

Permite escolher:

- emoji/avatar do usuário
- cor de fundo do avatar

## EditNameModal
**Implementado**

Permite editar:

- nome
- sobrenome

## EditCoursesModal
**Implementado**

Permite alterar:

- 1ª opção de curso
- 2ª opção de curso
- busca no catálogo completo

## LocationSettingsModal
**Implementado**

Permite configurar dois contextos diferentes:

1. localização atual
2. destino de estudos

Cada contexto possui:

- estado
- cidade

O fluxo atual usa Brasil como país padrão.

## GoalsModal
**Implementado / Parcial**

Permite selecionar universidades-meta.

Hoje ele foca em:

- busca
- seleção múltipla
- preview do vestibular/próxima prova

No futuro esse fluxo deve virar um sistema mais completo de planejamento acadêmico.

## SavedPostsModal
**Implementado**

Mostra todos os posts salvos pelo usuário.

Cada item exibe:

- universidade
- tipo/tag
- título
- resumo

## ShareModal
**Implementado / Parcial**

Hoje oferece:

- WhatsApp
- Twitter/X
- copiar texto

Observação:

- o modo `Copiar` hoje só mostra alerta de sucesso; não há integração completa com clipboard real dentro deste fluxo

## UniSortModal
**Implementado / Parcial**

Permite definir como ordenar universidades seguidas:

- por data de prova
- por preferência manual

No modo de preferência:

- o usuário pode atribuir pesos 10, 7, 5, 3 ou 1 para cada universidade seguida

Esse recurso já existe no estado global, mas a entrada visual dele ainda não está exposta de forma forte no fluxo principal.

---

## Conta institucional / Institution Mode

## Objetivo

Oferecer uma experiência administrativa para universidades gerenciarem suas próprias informações.

## Fluxo atual
**Implementado / Parcial**

Quando o usuário autenticado possui:

- `tipo === "instituicao"`
- `linkedUniId` válido

A aba `Perfil` deixa de renderizar o perfil comum e passa a renderizar `InstitutionAdminScreen`.

## O que a instituição consegue fazer hoje
**Implementado / Parcial**

### Identidade visual

- alterar foto/logo via mesmo fluxo de avatar disparado externamente
- alterar cor principal da universidade

### Informações institucionais editáveis

- descrição
- nome do vestibular
- período de inscrição
- data da prova
- site oficial
- cursos
- livros obrigatórios

### Informações exibidas

- nome curto
- nome completo
- descrição
- cor institucional
- número de seguidores

### Ações rápidas

- abrir configurações
- abrir site oficial
- editar cursos
- editar livros
- editar descrição

## Estado atual do modo institucional

O recurso está funcional, mas ainda incompleto.

### O que ainda falta consolidar

- contato institucional completo
- endereço institucional completo
- e-mail/telefone com boa UX
- settings específicos para instituição
- dashboard com analytics
- publicação de posts e stories dentro da UI institucional
- gerenciamento de provas, vagas e oportunidades de forma robusta
- múltiplos administradores
- verificação institucional formal

---

## Conteúdo e dados do app

## Fontes atuais de dados

### Firebase
**Implementado / Parcial**

Coleções e estruturas já usadas:

- `usuarios`
- `universidades`
- `posts`
- `posts/{postId}/likes`
- `reports`
- `cursos`
- `icones`
- `countries`
- `states`
- `cities`
- `universidades/{uniId}/stories`

### Dados locais seedados
**Implementado**

Arquivos principais usados como fallback ou catálogo base:

- `userTypes`
- `areas`
- `universities`
- `feed`
- `notasCorte`
- `events`
- `geo`
- `subjects`

## Estado global por domínio
**Implementado**

### `authStore`

- usuário autenticado
- dados do documento do usuário
- flags de bootstrap/autenticação
- helpers para institution mode

### `onboardingStore`

- etapa atual
- onboarding concluído ou não
- tipo de usuário
- curso 1
- curso 2

### `profileStore`

- nome e sobrenome
- tema
- avatar e cor do avatar
- notas do usuário
- localização atual
- destino de estudos

### `progressStore`

- status de leitura de livros
- livros em leitura
- tarefas concluídas

### `postsStore`

- posts do feed
- likes
- salvos

### `storiesStore`

- stories carregadas
- ids visualizados
- agrupamento por universidade

### `universitiesStore`

- lista de universidades
- seleção atual
- universidades-meta
- preferências de ordenação
- modo de ordenação

### `coursesStore`

- cursos do backend
- ícones customizados

### `geoStore`

- países
- estados
- cidades

---

## Regras funcionais importantes para IA e desenvolvimento

## O que já personaliza a experiência hoje
**Implementado**

Os seguintes dados realmente impactam a experiência atual:

- universidades seguidas
- universidades-meta
- curso principal e secundário
- tipo de usuário
- localização desejada
- notas registradas
- livros lidos / em leitura
- posts salvos
- tema e avatar

## Diferença entre universidades seguidas e universidades-meta
**Implementado e muito importante**

Esses dois conceitos são diferentes e não devem ser misturados:

### Seguidas

Objetivo:

- alimentar feed
- alimentar stories
- formar lista `Seguindo`

### Meta / vou prestar vestibular

Objetivo:

- gerar tarefas
- gerar contagem regressiva de provas
- alimentar planejamento e perfil

## Diferença entre `Notas` e `Metas`

### Notas

Representam desempenho histórico do usuário.

### Metas

Representam direção futura do usuário.

Os dois domínios se cruzam no perfil e nas comparações de nota de corte, mas não são a mesma coisa.

## Diferença entre conta comum e institucional

### Conta comum

- acompanha jornada acadêmica pessoal
- registra notas e metas próprias

### Conta institucional

- administra informações da universidade
- não deve receber experiência de estudante por padrão

---

## Funcionalidades já existentes mas ainda simplificadas

## 1. Stories institucionais
**Parcial**

Já existem backend, store e viewer, mas ainda falta um fluxo completo de criação dentro da interface institucional.

## 2. Feed remoto
**Parcial**

O app já busca posts reais, mas ainda depende de fallback seedado para garantir experiência mínima.

## 3. Notas de corte
**Parcial**

Já existe comparação funcional, mas o catálogo ainda é pequeno e local.

## 4. Eventos
**Parcial**

Já existe listagem e detalhe, mas ainda com base em dataset seedado pequeno.

## 5. Institution mode
**Parcial**

Já existe edição de alguns campos, mas ainda não é um painel institucional completo.

## 6. Localização
**Parcial**

O fluxo de estado/cidade está implementado, mas hoje é centrado no Brasil e ainda não cobre todos os cenários internacionais ou institucionais.

## 7. Ordenação de universidades
**Parcial**

A lógica já existe, mas o fluxo de descoberta/uso disso ainda pode ser melhor integrado na experiência principal.

---

## Roadmap funcional consolidado

Abaixo estão as funcionalidades e frentes de produto que já aparecem como direção desejada em `docs/notes.md`, `INSTITUTION_IMPROVEMENTS.md`, `CHANGES_SINCE_LAST_SESSION.md` e documentos de arquitetura.

## Auth e onboarding
**Planejado**

- termos e condições vindo do banco
- versionamento de termos
- reaceite obrigatório após alteração
- aviso por e-mail quando termos forem atualizados
- página/modal de termos mais robusta
- melhores animações de entrada e seleção
- revisão do fluxo visual de autenticação

## Feed
**Planejado**

- resumo/calendário de vestibulares no topo
- stories institucionais com publicação completa
- moderação de stories antes da publicação
- reações em stories
- salvar stories
- contadores de interesse por curso/universidade
- indicadores de tendência de interesse
- feed mais baseado em interesse declarado

## Explorar
**Planejado**

- navegador hierárquico de cursos por área > subárea > curso
- páginas dedicadas de curso
- filtro por localização, custo, duração e tipo de instituição
- calendário completo de vestibulares
- alertas para abertura de inscrição e nota de corte
- requisitos detalhados por prova
- perfil especial do ENEM com todos os recursos próprios
- badge de verificação para instituições

## Notas e simuladores
**Planejado**

- separação ainda mais explícita entre provas reais e simulados
- filtros por matéria, ano e tipo
- gráficos por mês/ano/tudo
- percentil comparativo com base agregada
- calculadora de admissão com pesos por universidade
- simulador `e se eu melhorar X pontos?`
- comparador de universidades por aderência ao desempenho do usuário
- simulador `Consigo passar?`

## Perfil e planejamento
**Planejado**

- perfil modular com seções reordenáveis
- calendário acadêmico mensal
- tracker de preparação por horas/disciplinas
- metas semanais e mensais
- organização avançada de salvos com tags/pastas
- gamificação, streaks e conquistas
- celebração de aprovação/aceite
- sugestões de rotas alternativas se o objetivo principal estiver distante

## Conteúdo acadêmico extra
**Planejado**

- flashcards
- quizzes
- tutores/perfis de apoio
- seção de bolsas
- seção de vagas e oportunidades
- FIES/Prouni/rotas alternativas

## Institution mode
**Planejado**

- autenticação institucional mais robusta
- painel analítico com crescimento, interesse e seguidores
- criação de posts pela instituição
- criação de stories pela instituição
- gestão de cursos, vagas e provas
- publicação de oportunidades
- notificações para seguidores
- multi-admin
- distinção clara entre conta estudante e conta institucional em settings e UX

## Dados e arquitetura
**Planejado**

- mais catálogos vindos do banco em vez de hardcoded
- expansão de universidades, provas, livros e eventos
- remoção de persistências diretas em UI onde ainda existirem
- padronização total service -> repository -> Firebase
- melhoria da separação entre estado local, cache e dado remoto autoritativo

---

## Resumo objetivo do que o app já é hoje

Hoje o Univest já funciona como:

1. um app de entrada e identidade acadêmica
2. um app de descoberta de universidades e cursos
3. um app de acompanhamento de vestibulares e provas
4. um app de comparação de notas com notas de corte
5. um app de organização de metas e tarefas de vestibular
6. um app de progresso de leitura de obras obrigatórias
7. um app de feed social-acadêmico com posts, stories, curtidas, saves e reports
8. um app com início de modo institucional para universidades

---

## Resumo do que falta para a visão completa do produto

Para chegar na visão mais ampla desejada, o Univest ainda precisa consolidar:

1. motor de decisão acadêmica
2. experiência institucional completa
3. catálogos remotos muito mais ricos
4. calendário e alertas acadêmicos robustos
5. organização avançada de salvos, estudos e progresso
6. ferramentas de preparação ativa como quizzes/flashcards
7. analytics e personalização mais fortes

---

## Regra final de manutenção deste documento

Toda mudança relevante no produto deve atualizar pelo menos um destes blocos:

- fluxo global
- comportamento da aba afetada
- lista de modais
- tipo de conta afetado
- fonte de dados / store responsável
- roadmap, se a mudança for futura e ainda não implementada

Este documento deve continuar sendo tratado como referência operacional do Univest, não apenas como rascunho conceitual.
