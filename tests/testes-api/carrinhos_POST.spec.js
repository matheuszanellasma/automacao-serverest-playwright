import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { UsuariosAPI } from '../../api/usuariosAPI'
import { LoginAPI } from '../../api/loginAPI'
import { CarrinhosAPI } from '../../api/carrinhosAPI'

test.describe('Suite de teste de Carrinhos - API (POST)', () => {

    let id_cadastro
    let authorization
    let id_produto1
    let id_produto2
    let quantidade_produto1
    let produtos
    let id_carrinho

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

        quantidade_produto1 = faker.number.int({ min: 1, max: 100 })
        const resposta_cadastro_produto1 = await produtosAPI.cadastrar(faker.commerce.productName(), faker.number.int({ min: 1, max: 100 }), faker.commerce.productDescription(), quantidade_produto1, authorization)
        const { _id: idProduto1 } = await resposta_cadastro_produto1.json()
        id_produto1 = idProduto1

        const quantidade_produto2 = faker.number.int({ min: 1, max: 100 })
        const resposta_cadastro_produto2 = await produtosAPI.cadastrar(faker.commerce.productName(), faker.number.int({ min: 1, max: 100 }), faker.commerce.productDescription(), quantidade_produto2, authorization)
        const { _id: idProduto2 } = await resposta_cadastro_produto2.json()
        id_produto2 = idProduto2   // 👈 corrigido: atribui à variável externa, não redeclara

        produtos = [
            { idProduto: id_produto1, quantidade: quantidade_produto1 },
            { idProduto: id_produto2, quantidade: quantidade_produto2 }
        ]
    })

    test('Criar carrinho com sucesso @smoke', async ({ carrinhosAPI }) => {
        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(produtos, authorization)
        const { message, _id } = await resposta_cadastrar_carrinho.json()

        expect(resposta_cadastrar_carrinho.status()).toBe(201)
        expect(message).toBe("Cadastro realizado com sucesso")
        expect(_id).toBeTruthy()

        id_carrinho = _id
    })

    test('Cadastrar dois carrinhos em um mesmo usuário', async ({ carrinhosAPI }) => {
        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(produtos, authorization)
        const { _id } = await resposta_cadastrar_carrinho.json()

        const resposta_cadastrar_carrinho_repetido = await carrinhosAPI.cadastrar(produtos, authorization)
        const { message } = await resposta_cadastrar_carrinho_repetido.json()

        expect(resposta_cadastrar_carrinho_repetido.status()).toBe(400)
        expect(message).toBe('Não é permitido ter mais de 1 carrinho')

        id_carrinho = _id
    })

    test('Cadastrar carrinho com token inválido', async ({ carrinhosAPI }) => {
        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(produtos, 'token_inválido')
        const { message } = await resposta_cadastrar_carrinho.json()

        expect(resposta_cadastrar_carrinho.status()).toBe(401)
        expect(message).toBe("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
    })

    test('Cadastrar carrinho com produto duplicado', async ({ carrinhosAPI }) => {

        const produtos_duplicados = [
            { idProduto: id_produto1, quantidade: quantidade_produto1 },
            { idProduto: id_produto1, quantidade: quantidade_produto1 }
        ]

        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(produtos_duplicados, authorization)
        const { message } = await resposta_cadastrar_carrinho.json()

        expect(resposta_cadastrar_carrinho.status()).toBe(400)
        expect(message).toBe('Não é permitido possuir produto duplicado')
    })

    test('Cadastrar carrinho com produto com quantidade insuficiente ', async ({ carrinhosAPI }) => {

        const produtos_insuficientes = [
            { idProduto: id_produto1, quantidade: quantidade_produto1 + 1 }
        ]

        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(produtos_insuficientes, authorization)
        const { message } = await resposta_cadastrar_carrinho.json()

        expect(resposta_cadastrar_carrinho.status()).toBe(400)
        expect(message).toBe('Produto não possui quantidade suficiente')
    })

    test('Cadastrar carrinho com produto inexiste ', async ({ carrinhosAPI }) => {

        const produtos_insuficientes = [
            { idProduto: 'id_inexistente', quantidade: quantidade_produto1 }
        ]

        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(produtos_insuficientes, authorization)
        const { message } = await resposta_cadastrar_carrinho.json()

        expect(resposta_cadastrar_carrinho.status()).toBe(400)
        expect(message).toBe('Produto não encontrado')
    })

    test.afterEach(async ({ produtosAPI, carrinhosAPI }) => {
        if (id_carrinho) {
            await carrinhosAPI.cancelar_compra(authorization)
            id_carrinho = undefined
        }
        if (id_produto1) {
            await produtosAPI.deletar(id_produto1, authorization)
            id_produto1 = undefined
        }
        if (id_produto2) {
            await produtosAPI.deletar(id_produto2, authorization)
            id_produto2 = undefined
        }
    })

    test.afterAll(async ({ usuariosAPI }) => {
        await usuariosAPI.deletar(id_cadastro)
    })
})
