
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
_____________________________________________

*********************************************
Now whenever you want to rebuild after changes, just run:
./build-and-run.sh
Or from anywhere:
/Users/App/repos/univest-native/build-and-run.sh
*********************************************
Save Everything
*********************************************

App
Telas
1. Tela de Bem-vindo ao App + Slogan +
Botão "Começar Jornada"
2. App - "Seu portal inteligente para todos os momentos da sua jornada acadêmica"
Interesses:
- Ensino médio e Técnico
- Vestibulares e ENEM
- Graduação (e pós-graduação?)
- Metrado
- Doutorado
- Pós-doutorado
- Pesquisadores
3. O que melhor descreve você agora?
Você pode alterar isso depois
- Ensino Médio - Cursando o ensino médio regular
- Ensino Médio Técnico - Ex: COTUCA, ETEC, SENAI, IFSP
- Pré-vestibulando - Me preparando para vestibulares
- Foco no ENEM - Estudando para o
ENEM / SISU
- Graduando - Cursando uma graduação
- Pré-mestrado - Buscando uma vaga em mestrado
- Mestrando - Cursando o mestrado
- Pré-doutorado - Buscando uma vaga em doutorado
- Doutorando - Cursando o doutorado
- Pós-doutorando - Realizando pesquisa pós-doutoral
- Educação Continuada - Cursos livres,
MBA, Especializações
Cada item precisa ter uma tela 4 diferente. Por exemplo: para pré-vestibulandos, listar os cursos de graduação: medicina, biologia, geografia etc. Para mestrado: pago, gratuito, com bolsa, sem bolsa etc.
4. Siga suas universidades - Você verá as novidades delas no seu feed (isso deve ser diferente dependendo da escolha de descrição do usuário, pré-vestibulando, ensino medio técnico etc.)

INICIO OFICIAL DO APP
- Feed
- Explorar
ー
Notas
- Perfil
*********************************************

- Make profile items modular

- In "provas", I want a separation between real exams the person has taken and mock exams (simulados) they have done. Also add a chart so they can see how many real exams and mock exams they've taken in their entire life. This chart should show multiple views, such as by month, by year, and all time (since the first mock exam and real exam).

- In the "saved" section, it should be posts or links saved for the user to consult later. Consider changing the UI to make it easier for the user to access this content at another time—perhaps a different layout or organization would work better.

- I'd like the app to also be gamified (think of ideas for this) to encourage people to use it. One thing I thought would be cool would be to place somewhere which exams or mock exams the person is going to take, and somewhere show, based on that, how many days are left until the date of that exam or mock exam.

- In the profile, under "Universidades que sigo", I want a smaller icon for each university so more can fit and it stays organized. I want the person to be able to sort by date order (based on exam dates) and/or by preference order (which university they want to get into the most). A system needs to be created within this tab (it can be linked to another new tab (without adding it to the menu bar)), a place where they can edit this.

- Create a profile for ENEM as if it were a university

- Maybe link profiles of private tutors? Explore the idea
- Add a calendar to the profile and maybe add a calendar summary to the feed, in place of stories
- Add a verified badge for universities that have been accredited and control their own pages
- Within each university, be able to see all exams from previous years, previous mock exams, and previously required books
- Job openings?
- Scholarship openings in general, tutoring and internships, scientific initiation
- Companies registering to offer internships?
- FIES
- Explore filter
- Grade filter
- After someone gets accepted into a university, option to set it as a background and some kind of celebration
including if they get accepted into more than one university
```
- Make name mandatory during account creation	Already needed	This is standard - you want to enforce it. Question: What happens if they don't provide a name? Just block signup or use email prefix?

- "Seguindo" explicitly shows universities	High	Rename to "Instituições" or add icon/label	Should we also show "institutions I intend to take vestibular"?

- Split "provas" into real vs simulators	High	Separate counters: "X provas" + "Y simulados"

- Add charts: provas/simulados by month, year, all-time	Medium	Bar or line chart showing history	Do you want 3 toggle views (mês/ano/toda vida)?

- Gamification - countdown to exams	High	Show "X days until [exam name]" in profile or feed	Only for followed universities or all vestibulares?
- Universities I follow - smaller icons, organize by date/preference	High	Create sorting system + edit screen (link to new area, not new tab in nav)	Should I create a "Manage Universities" modal accessible from profile?

- Flashcard mode (user creates + ready mode)	Medium	Two modes: create own cards, use pre-made subject flashcards	Should pre-made flashcards be tied to specific courses?

- Delete comment field	Low	Remove comments from posts	Just remove completely?

- Add report/wrong info button on posts	Low	Flag button for inappropriate content	What happens when someone reports? (just removes, or admin review?)

- Quiz	Medium	Quiz mode for studying	Subject-specific or general?

- "Universidades que pretendo fazer vestibular" (not just following)	High	Separate "following" (receiving news) vs "intending to take" (affects recommendations)	Should this show TODO list like books to read?

- TODO based on chosen universities (books, topics, etc)	High	"Read these books", "Study this topic for writing"	Auto-generate from university data (books already in DB)?

- Vestibular requirements (pen color, documents, food, etc)	Medium	Add "Exam requirements" section per university	Would you like to add this to the existing university detail page?

- ENEM as a "university" profile	Medium	Treat ENEM like USP/UNICAMP with its own exam dates, requirements

- Teacher/Tutor profiles	Future	Explore idea - not clear yet	What would this show? (list of teachers, ratings, contact?)

- Calendar in profile + feed summary	Medium	Add calendar tab in profile + stories area shows upcoming events

- Verified badge for universities	Low	Visual checkmark for official/verified institutions	Would this be manually set in DB or automatic?

- Inside each uni - all past exams, previous books	High	Already have some of this in university detail!	Would you like to expand what's already there?

- Job openings / Internship / Scholarships	Future	New section for opportunities	Would this be a new tab or part of explorar?

- FIES info	Low	Add financial aid information	Where? In university detail or separate section?

- Filters in Notas	Low	Filter grades by subject/year

- "Passed" celebration (if pass in uni)	Low	Confetti/celebration when user marks "I passed"	Include multiple universities celebration?

💭 Future / Consider Later
- Consider SQLite	You mentioned this would replace Firebase for local data

- Consider SQL DB	For backend data (replacing Firebase)

- All past exams from all vestibulares	Big task - need to source dataT

---------------------------------------

- Um lugar no perfil que de para adicionar todos os livros lidos e ai quando estiver nos todos ele ja compara e da um checkmark caso já tiver lido

- Alterar "Essa nota de corte..." por "Os cursos selecionados guiam toda a análise abaixo"

- Tornar itens do perfil modular

Alterações:
- Na tab de perfil, quero que o usuário possa colocar de qual cidade ou estado ela é (para de o app consiga mostrar as universidades baseado na localização dela) e qual cidade ou estado ela gostaria de cursar, para que o app saiba quais universidades ela vai ter acesso naquele lugar.
- Na Tab de perfil, preciso que seja mais explicito que o "seguindo" é universidades, ou instituições etc, em "provas" quero que separe entre provas que a pessoa fez de verdade e simulados que ela fez. Adicione também um gráfico pra ela poder ver quantas provas e quantos simulados fez na vida toda. Esse gráfico deve mostrar em várias visões, como por mes, por ano e toda a vida (desde o primeiro simulado e prova).
- In the "saved" section, it should be posts or links saved for the user to consult later. Consider changing the UI to make it easier for the user to access this content at another time—perhaps a different layout or organization would work better.
- Gostaria que o app fosse também gamificado (pense em ideias para isso) para estimular as pessoas a usarem. Uma coisa que pensei que seria legal, seria colocar em algum lugar quais provas a pessoa vai fazer ou simulado e em algum lugar mostrasse com base nisso quantos dias faltam para a data dessa prova ou simulado.
- No perfil, em "Universidades que sigo", quero seja um ícone menor para cada universidade, pra caber mais e fique organizado. Quero que a pessoa possa organizar por ordem de data (com base nas datas das provas) e/ou por ordem de preferencia (qual universidade ela quer mais entrar). Precisa criar um sistema dentro dessa aba (pode ser linkando com outra tab nova (sem adicionar na barra de menu), um lugar que ela possa editar isso.
- Flashcard de matéria (o usuário montar e um modo pronto)
- Ver de usar SQLite
- Ver de fazer ja um DB em SQL
- Colocar todas as provas de todos os vestibulares de anos anteriores (provas antigas, respostas e simulados)
- Quiz
- No perfil, não somente colocar as universidades que eu sigo, mas universidades que pretendo fazer o vestibular
- Com base nas universidades que eu marcar que quero prestar o vestibular, listar coisas tipo um TODO no perfil, tipo
"ler os seguintes livros",
" estudar
"redação estilo carta" etc.
- Estruturar
- Colocar requisitos de cada vestibular: qual cor de caneta levar, quais documentos, se pode levar comida, etc.
- Criar um perfil pra o ENEM como se fosse uma universidade
- Talvez linear perfil de professores particulares? Explorar a ideia
- Adicionar um calendário no perfil e adicionar um resumo do calendário no feed talvez, no lugar dos stories
- Adicionar um verificado para universidades que foram credenciadas e controlam suas próprias paginas
- Dentro de cada universidade, poder ver todas as provas dos anos anteriores e simulados anteriores e livros pedidos anteriormente
- Vaga de emprego?
- Vaga de bolsas no geral, monitoria e estágio, iniciação cientifica
- Empresas se cadastrarem pra oferecer estagio?
- FIES
- Filtro do explorar
- Filtro para notas
- depois que alguem passar em alguma universidade, opção de colocar como fundo e alguma coisa de comemoração
incluindo se ela passar em mais de uma universidade
- Flashcard by subject (user-built and a ready-made mode)
- Look into using SQLite
- Look into already building a SQL DB
- Quiz

https://fontawesome.com/
https://ionic.io/ionicons


Page 1 - (Seu portal...)
- Add new item as "Cursos e outros"
- Remove the ">" from each box
- Make a better animation when clicking "Entrar ou criar conta"

Page 2 - (Entrar and Criar Conta)

Can we claruify the name of the things in the app? Like, what are pages, pop-up, fields, boxes etc. Because I want to be able to tell you exactly what and where to act
Once we define that, add it to the readme.md



- Clicking the terms and conditions should open up something (help me decide what fits better), could be a page, pop-up, whatever with the actual terms and conditions (you can write a simple one so we can use as a place holder)