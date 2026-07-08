import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { LoginAPI } from "../../api/loginAPI"
import { ProdutosAPI } from "../../api/produtosAPI"
import { UsuariosAPI } from "../../api/usuariosAPI"

test.describe('Suite de teste de Produtos - API (DELETE)', () => {

    let id_cadastro
    let authorization
    let id_produto
    let nome_produto
    let preco_produto
    let descricao_produto
    let quantidade_produto

    test.beforeAll(async ({ usuariosAPI, loginAPI }) => {

        const nome = faker.person.fullName()
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
        const { _id } = await resposta_cadastro.json()
        id_cadastro = _id

        const resposta_login = await loginAPI.logar(email, senha)
        const { authorization: token } = await resposta_login.json()
        authorization = token
    })

    test.beforeEach(async ({ produtosAPI }) => {
        nome_produto = faker.commerce.productName()
        preco_produto = faker.number.int({ min: 1, max: 100 })
        descricao_produto = faker.commerce.productDescription()
        quantidade_produto = faker.number.int({ min: 1, max: 100 })
        const resposta_cadastrar_produto = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, authorization)
        const { _id } = await resposta_cadastrar_produto.json()
        id_produto = _id
    })

    test('Deletar produto com sucesso @smoke', async ({ produtosAPI }) => {
        const resposta_deletar_produto = await produtosAPI.deletar(id_produto, authorization)
        const { message } = await resposta_deletar_produto.json()

        expect(resposta_deletar_produto.status()).toBe(200)
        expect(message).toBe("Registro excluído com sucesso")
        id_produto = undefined
    })

    test('Deletar produto com usuário normal', async ({ usuariosAPI, loginAPI, produtosAPI }) => {
        const nome_normal = faker.person.fullName()
        const email_normal = faker.internet.email()
        const senha_normal = faker.internet.password()

        const resposta_cadastro_normal = await usuariosAPI.cadastrar(nome_normal, email_normal, senha_normal, 'false')
        const { _id: id_cadastro_normal } = await resposta_cadastro_normal.json()

        const resposta_login_normal = await loginAPI.logar(email_normal, senha_normal)
        const { authorization: authorization_normal } = await resposta_login_normal.json()

        const resposta_deletar_produto = await produtosAPI.deletar(id_produto, authorization_normal)
        const { message } = await resposta_deletar_produto.json()

        expect(resposta_deletar_produto.status()).toBe(403)
        expect(message).toBe("Rota exclusiva para administradores")

        await usuariosAPI.deletar(id_cadastro_normal)
    })

    test('Deletar produto com token inválido', async ({ produtosAPI }) => {
        const resposta_deletar_produto = await produtosAPI.deletar(id_produto, 'token_inválido')
        const { message } = await resposta_deletar_produto.json()

        expect(resposta_deletar_produto.status()).toBe(401)
        expect(message).toBe("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
    })

    test('Deletar produto já excluído ou inexiste', async ({ produtosAPI }) => {
        await produtosAPI.deletar(id_produto, authorization)

        const resposta_redeletar_produto = await produtosAPI.deletar(id_produto, authorization)
        const { message } = await resposta_redeletar_produto.json()

        expect(resposta_redeletar_produto.status()).toBe(200)
        expect(message).toBe("Nenhum registro excluído")
        id_produto = undefined
    })

    test('Deletar produto dentro de um carrinho', async ({ produtosAPI, carrinhosAPI }) => {
        await carrinhosAPI.cadastrar([{ idProduto: id_produto, quantidade: quantidade_produto }], authorization)

        const resposta_deletar_produto = await produtosAPI.deletar(id_produto, authorization)
        const { message } = await resposta_deletar_produto.json()

        expect(resposta_deletar_produto.status()).toBe(400)
        expect(message).toBe("Não é permitido excluir produto que faz parte de carrinho")
        

        await carrinhosAPI.cancelar_compra(authorization)
    })

    test.afterEach(async ({ produtosAPI }) => {
        if (id_produto) {
            await produtosAPI.deletar(id_produto, authorization)
            id_produto = undefined
        }
    })

    test.afterAll(async ({ usuariosAPI }) => {
        await usuariosAPI.deletar(id_cadastro)
    })

})
