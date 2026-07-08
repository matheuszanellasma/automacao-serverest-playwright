import { faker } from '@faker-js/faker';
import { test, expect } from '../../support/baseTest';


test.describe('Suíte de testes da página de login (WEB)', () => {

    const nome_admin = faker.person.fullName()
    const email_admin = faker.internet.email()
    const senha_admin = faker.internet.password()
    const nome_normal = faker.person.fullName()
    const email_normal = faker.internet.email()
    const senha_normal = faker.internet.password()
    let id_cadastro_admin
    let id_cadastro_normal

    test.beforeAll(async ({ usuariosAPI }) => {
        const resposta_cadastro_admin = await usuariosAPI.cadastrar(nome_admin, email_admin, senha_admin, 'true')
        expect(resposta_cadastro_admin.status()).toBe(201)
            ; ({ _id: id_cadastro_admin } = await resposta_cadastro_admin.json())

        const resposta_cadastro_normal = await usuariosAPI.cadastrar(nome_normal, email_normal, senha_normal, 'false')
        expect(resposta_cadastro_normal.status()).toBe(201)
            ; ({ _id: id_cadastro_normal } = await resposta_cadastro_normal.json())
    })

    const cenarios_login = [
        { teste: 'normal', email: email_normal, senha: senha_normal, url_direcionada: '**/home', texto_bem_vindo: 'Serverest Store', texto_menu: 'Lista de Compras' },
        { teste: 'admin', email: email_admin, senha: senha_admin, url_direcionada: '**/admin/home', texto_bem_vindo: `Bem Vindo ${nome_admin}`, texto_menu: 'Cadastrar Produtos' }
    ]

    cenarios_login.forEach((cenario) => {
        test(`Login ${cenario.teste} com sucesso com credenciais válidas @smoke`, async ({ page, loginPage }) => {
            await loginPage.logar_usuario(cenario.email, cenario.senha)

            await page.waitForURL(cenario.url_direcionada)
            await expect(loginPage.mensagem_bem_vindo).toContainText(cenario.texto_bem_vindo)
            await expect(loginPage.menu_superior).toContainText(cenario.texto_menu)
            await expect(loginPage.botao_logout).toBeVisible()
        })
    })

    const cenarios_validacao = [
        { teste: 'email não cadastrado', email: faker.internet.email(), senha: faker.internet.password(), msg_erro: 'Email e/ou senha inválidos' },
        { teste: 'senha inválida', email: email_admin, senha: faker.internet.password(), msg_erro: 'Email e/ou senha inválidos' },
        { teste: 'email em branco', email: '', senha: faker.internet.password(), msg_erro: 'Email é obrigatório' },
        { teste: 'senha em branco', email: email_admin, senha: '', msg_erro: 'Password é obrigatório' }
    ]

    cenarios_validacao.forEach((cenario) => {
        test(`Validação de login com ${cenario.teste}`, async ({ loginPage, page }) => {
            await loginPage.logar_usuario(cenario.email, cenario.senha)
            await expect(page.getByText(cenario.msg_erro)).toBeVisible()
        })
    })

    test('Teste de redirecionamento - botão "Cadastrar"', async ({page, loginPage, cadastroPage})=>{
        await loginPage.ir_para_cadastro()

        await page.waitForURL(`**${cadastroPage.rota}`)
        await expect(cadastroPage.titulo_cadastro).toBeVisible()
    })

    test.afterAll(async ({ usuariosAPI }) => {
        const resposta_delete_admin = await usuariosAPI.deletar(id_cadastro_admin)
        expect(resposta_delete_admin.status()).toBe(200)
        const resposta_delete_normal = await usuariosAPI.deletar(id_cadastro_normal)
        expect(resposta_delete_normal.status()).toBe(200)
    })
})