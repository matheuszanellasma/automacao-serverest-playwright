[![CI](https://github.com/matheuszanellasma/automacao-serverest-playwright/actions/workflows/push.yml/badge.svg)](https://github.com/matheuszanellasma/automacao-serverest-playwright/actions)

# 🎭 Automação de Testes ServeRest com Playwright

## 💻 Sobre o projeto
Este repositório contém o projeto de automação de testes **de API e Web (UI)** para a aplicação **ServeRest**, uma aplicação pública utilizada para prática de testes de software. O objetivo deste projeto é garantir a qualidade, estabilidade e o funcionamento correto tanto dos endpoints da API quanto dos principais fluxos da interface web da aplicação.

## 🛠️ Tecnologias Utilizadas
Neste projeto, utilizamos as seguintes ferramentas:
- **[Node.js](https://nodejs.org/en/)**
- **[Playwright](https://playwright.dev/)**
- **Padrão de Projeto:**  API Client Pattern (API) e Page Object Model (Web)
- **Faker.js:** geração dinâmica de dados de teste, aumentando a cobertura de variações
- **Fixtures customizadas:** setup e reuso de contexto (autenticação, clientes de API) entre os testes

## 🌐 Ambiente de Testes
🔗 **Aplicação Web:** [ServeRest Front-end](https://front.serverest.dev/)
🔗 **Documentação da API:** [ServeRest API](https://serverest.dev/?lang=pt-BR)

## 📁 Estrutura dos Testes
Os testes estão organizados em duas suítes principais, separadas por camada de teste:

### `testes-api/`
- `login_POST.spec.js` – Autenticação via API
- `cadastro_POST.spec.js` – Cadastro de usuários
- `cadastro_DELETE.spec.js` – Exclusão de usuários
- `produtos_POST.spec.js` – Cadastro de produtos
- `produtos_DELETE.spec.js` – Exclusão de produtos
- `carrinhos_POST.spec.js` – Criação de carrinhos
- `carrinhos_DELETE.spec.js` – Exclusão/cancelamento de carrinhos

### `testes-web/`
- `login.spec.js` – Autenticação via interface
- `cadastro.spec.js` – Cadastro de usuário via interface
- `produtos_cadastro.spec.js` – Cadastro de produtos via interface
- `produtos_lista.spec.js` – Listagem e exclusão de produtos via interface

Cada arquivo contém os casos de teste relacionados à sua funcionalidade, incluindo cenários de sucesso, validações de campos obrigatórios e regras de negócio específicas.

## ⚙️ Integração Contínua (CI/CD)
O projeto possui uma esteira automatizada de integração contínua implementada com **GitHub Actions**:
- **Gatilho:** A esteira é disparada automaticamente a cada evento de `push` realizado na branch `master`.
- **Ação:** O pipeline executa os testes **Smoke**.
- **Armazenamento:** O relatório é armazenado como artifact no GitHub por **30 dias**, permitindo análise dos resultados mesmo após a conclusão do pipeline.

## 🛠️ Como Executar os Testes Localmente
### Pré-requisitos: Node.js (versão 18 ou superior recomendada)
### Passo a Passo (Configuração e Execução)
```bash
git clone https://github.com/matheuszanellasma/automacao-serverest-playwright.git
cd automacao-serverest-playwright
npm install
npx playwright install
npx playwright test --ui
```

## 👤 Autor
* **Matheus Koehler Zanella** - Quality Assurance Engineer
