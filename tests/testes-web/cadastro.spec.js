
import { faker } from '@faker-js/faker';
import { test, expect } from '../../support/baseTest';


test.describe('Suite de testes da página de Cadastro (Web)', () => {

    const cenarios_sucesso = [
        { teste: 'admin', admin: true, url_direcionada: '**/admin/home', texto_bem_vindo: `Bem Vindo`, texto_menu: 'Cadastrar Produtos' },
        { teste: 'normal', admin: false, url_direcionada: '**/home', texto_bem_vindo: `Serverest Store`, texto_menu: 'Lista de Compras' }
    ]

    cenarios_sucesso.forEach((cenario) => {
        test(`Cadastro ${cenario.teste} com sucesso com credenciais válidas @smoke`, async ({ page, cadastroPage, usuariosAPI }) => {
            const email = faker.internet.email()
            await cadastroPage.cadastrar_usuario({ email, admin: cenario.admin })

            await page.waitForURL(cenario.url_direcionada)
            await expect(cadastroPage.mensagem_bem_vindo).toContainText(cenario.texto_bem_vindo)
            await expect(cadastroPage.menu_superior).toContainText(cenario.texto_menu)
            await expect(cadastroPage.botao_logout).toBeVisible()

            const id_cadastro = await usuariosAPI.buscar_id_por_email(email)
            const resposta_delete = await usuariosAPI.deletar(id_cadastro)
            expect(resposta_delete.status()).toBe(200)
        })
    })

    test(`Cadastro com email já cadastrado`, async ({ page, cadastroPage, usuariosAPI }) => {
        const email = faker.internet.email()
        await cadastroPage.cadastrar_usuario({ email, admin: true })
        await page.waitForURL('**/admin/home')
        await cadastroPage.cadastrar_usuario({ email, admin: true })

        await expect(cadastroPage.mensagem_email_duplicado).toBeVisible()

        const id_cadastro = await usuariosAPI.buscar_id_por_email(email)
        const resposta_delete = await usuariosAPI.deletar(id_cadastro)
        expect(resposta_delete.status()).toBe(200)
    })

    const cenarios_validacao = [
        { teste: 'nome vazio', nome: '', email: faker.internet.email(), senha: faker.internet.password(), erro: "Nome é obrigatório" },
        { teste: 'email vazio', nome: faker.person.fullName(), email: '', senha: faker.internet.password(), erro: "Email é obrigatório" },
        { teste: 'senha vazia', nome: faker.person.fullName(), email: faker.internet.email(), senha: '', erro: "Password é obrigatório" },
        { teste: 'email inválido', nome: faker.person.fullName(), email: 'teste@teste', senha: faker.internet.password(), erro: "Email deve ser um email válido" }
    ]

    cenarios_validacao.forEach((cenario) => {
        test(`Validação de cadastro com ${cenario.teste}`, async ({ page, cadastroPage }) => {
            await cadastroPage.cadastrar_usuario({ nome: cenario.nome, email: cenario.email, senha: cenario.senha, admin: true })
            await expect(page.getByText(cenario.erro)).toBeVisible()
        })
    })

    const cenarios_validacao_nativa = [
        { teste: 'email sem @', email: 'matheuskzanella' },
        { teste: 'email sem domínio após @', email: 'matheuskzanella@' }
    ]

    cenarios_validacao_nativa.forEach((cenario) => {
        test(`Validação nativa de ${cenario.teste}`, async ({ cadastroPage }) => {
            await cadastroPage.cadastrar_usuario({ email: cenario.email })

            const campo_valido = await cadastroPage.campo_email.evaluate(el => el.validity.valid)
            expect(campo_valido).toBe(false)

            const erro_tipo_email = await cadastroPage.campo_email.evaluate(el => el.validity.typeMismatch)
            expect(erro_tipo_email).toBe(true)
        })
    })

    test('Teste de redirecionamento - Botão "Entrar"', async ({ cadastroPage, page, loginPage }) => {
        await cadastroPage.ir_para_login()

        await page.waitForURL(`**${loginPage.rota}`)
        await expect(loginPage.titulo_login).toBeVisible()
    })
})