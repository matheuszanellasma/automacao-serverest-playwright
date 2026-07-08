import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { LoginAPI } from "../../api/loginAPI"
import { ProdutosAPI } from "../../api/produtosAPI"
import { UsuariosAPI } from "../../api/usuariosAPI"

test.describe('Suite de teste de Produtos - API (POST)', () => {

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

    test.beforeEach(async ({}) => {
        nome_produto = faker.commerce.productName()
        preco_produto = faker.number.int({ min: 1, max: 100 })
        descricao_produto = faker.commerce.productDescription()
        quantidade_produto = faker.number.int({ min: 1, max: 100 })
    })

    test(`Cadastro de produto com credenciais válidas @smoke`, async ({ produtosAPI }) => {

        const resposta_cadastro_produto = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, authorization)
        const { message, _id } = await resposta_cadastro_produto.json()
        expect(resposta_cadastro_produto.status()).toBe(201)
        expect(message).toBe("Cadastro realizado com sucesso")
        expect(_id).toBeTruthy()
        id_produto = _id
    })

    test(`Cadastro de produto com usuário normal`, async ({ usuariosAPI, loginAPI, produtosAPI }) => {

        const nome_normal = faker.person.fullName()
        const email_normal = faker.internet.email()
        const senha_normal = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome_normal, email_normal, senha_normal, 'false')
        const { _id: id_cadastro_normal } = await resposta_cadastro.json()

        const resposta_login = await loginAPI.logar(email_normal, senha_normal)
        const { authorization: authorization_normal } = await resposta_login.json()

        const resposta_cadastro_produto = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, authorization_normal)
        const { message } = await resposta_cadastro_produto.json()
        expect(resposta_cadastro_produto.status()).toBe(403)
        expect(message).toBe("Rota exclusiva para administradores")

        await usuariosAPI.deletar(id_cadastro_normal)
    })

    test(`Cadastro de produto com nome repetido`, async ({ produtosAPI }) => {

        const resposta_cadastro_produto = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, authorization)
        const { _id } = await resposta_cadastro_produto.json()

        const resposta_cadastro_produto_repetido = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, authorization)
        const { message } = await resposta_cadastro_produto_repetido.json()
        expect(resposta_cadastro_produto_repetido.status()).toBe(400)
        expect(message).toBe("Já existe produto com esse nome")

        id_produto = _id
    })

    test(`Cadastro de produto com token inválido`, async ({ produtosAPI }) => {

        const resposta_cadastro_produto = await produtosAPI.cadastrar(nome_produto, preco_produto, descricao_produto, quantidade_produto, 'token invalido')
        const { message } = await resposta_cadastro_produto.json()

        expect(resposta_cadastro_produto.status()).toBe(401)
        expect(message).toBe("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")
    })

    const cenarios_validacao = [
        { teste: 'nome vazio', nome: undefined, preco: faker.number.int(100), descricao: faker.lorem.text(), quantidade: faker.number.int(100), seletor: 'nome', erro: "nome é obrigatório" },
        { teste: 'preço vazio', nome: faker.commerce.productName(), preco: undefined, descricao: faker.lorem.text(), quantidade: faker.number.int(100), seletor: 'preco', erro: "preco é obrigatório" },
        { teste: 'descrição vazia', nome: faker.commerce.productName(), preco: faker.number.int(100), descricao: undefined, quantidade: faker.number.int(100), seletor: 'descricao', erro: "descricao é obrigatório" },
        { teste: 'quantidade vazia', nome: faker.commerce.productName(), preco: faker.number.int(100), descricao: faker.lorem.text(), quantidade: undefined, seletor: 'quantidade', erro: "quantidade é obrigatório" },
        { teste: 'preço negativo', nome: faker.commerce.productName(), preco: faker.number.int({ min: -100, max: -1 }), descricao: faker.lorem.text(), quantidade: faker.number.int(100), seletor: 'preco', erro: "preco deve ser um número positivo" },
        { teste: 'quantidade negativa', nome: faker.commerce.productName(), preco: faker.number.int(100), descricao: faker.lorem.text(), quantidade: faker.number.int({ min: -100, max: 0 }), seletor: 'quantidade', erro: "quantidade deve ser maior ou igual a 0" }
    ]

    cenarios_validacao.forEach((cenario) => {
        test(`Validação de cadastro de produto com ${cenario.teste}`, async ({ produtosAPI }) => {
            const resposta_cadastro_produto = await produtosAPI.cadastrar(cenario.nome, cenario.preco, cenario.descricao, cenario.quantidade, authorization)
            expect(resposta_cadastro_produto.status()).toBe(400)
            const body_reposta_cadastro_produto = await resposta_cadastro_produto.json()
            expect(body_reposta_cadastro_produto[cenario.seletor]).toBe(cenario.erro)
        })
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

