import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'


test.describe('Suíte de testes da página de Lista de Produtos - ADM (WEB)', () => {

    let id_cadastro
    let authorization
    let id_produto
    let nome_produto
    let preco_produto
    let descricao_produto
    let quantidade_produto
    const caminho_imagem = "tests/fixtures/monitor.jfif"
    const nome = faker.person.fullName()
    const email = faker.internet.email()
    const senha = faker.internet.password()

    test.beforeAll(async ({ usuariosAPI, loginAPI }) => {
        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
            ; ({ _id: id_cadastro } = await resposta_cadastro.json())
        const resposta_login = await loginAPI.logar(email, senha)
            ; ({ authorization } = await resposta_login.json())
    })

    test.beforeEach(async ({ produtos_listaPage, produtos_cadastroPage, produtosAPI }) => {
        await produtos_listaPage.injetar_autenticacao({ email, nome, senha, authorization })

        nome_produto = faker.commerce.productName()
        preco_produto = faker.number.int({ min: 1, max: 100 })
        descricao_produto = faker.commerce.productDescription()
        quantidade_produto = faker.number.int({ min: 1, max: 100 })

        const resposta_cadastro_produto = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, authorization)
            ; ({ _id: id_produto } = await resposta_cadastro_produto.json())
    })


    test('Produto criado aparece na lista com sucesso @smoke', async ({ page, produtos_listaPage }) => {
        await produtos_listaPage.acessar_lista_produto()

        const celulas = await produtos_listaPage.obter_dados_produto_na_lista(nome_produto)

        await expect(celulas.nth(0)).toHaveText(nome_produto)
        await expect(celulas.nth(1)).toHaveText(preco_produto.toString())
        await expect(celulas.nth(2)).toHaveText(descricao_produto)
        await expect(celulas.nth(3)).toHaveText(quantidade_produto.toString())
    })

    test('Excluir produto com sucesso @smoke', async ({ page, produtos_listaPage }) => {
        await produtos_listaPage.acessar_lista_produto()

        await produtos_listaPage.excluir_produto(nome_produto)


        const linha_produto = await produtos_listaPage.obter_linha_produto(nome_produto)
        await expect(linha_produto).toHaveCount(0)
        id_produto = undefined
    })

    test.afterEach(async ({ produtosAPI, page }) => {
        if (id_produto) {
            const resposta_delete_produto = await produtosAPI.deletar(id_produto, authorization)
            expect(resposta_delete_produto.status()).toBe(200)
        }
    })

    test.afterAll(async ({ usuariosAPI }) => {
        const resposta_delete_cadastro_usuario = await usuariosAPI.deletar(id_cadastro)
        expect(resposta_delete_cadastro_usuario.status()).toBe(200)
    })
})