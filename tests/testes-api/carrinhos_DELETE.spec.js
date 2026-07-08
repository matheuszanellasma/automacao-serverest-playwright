import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { UsuariosAPI } from '../../api/usuariosAPI'
import { LoginAPI } from '../../api/loginAPI'
import { CarrinhosAPI } from '../../api/carrinhosAPI'

test.describe('Suite de teste de Carrinhos - API (DELETE)', () => {

    let id_cadastro
    let authorization
    let id_produto1
    let id_produto2
    let quantidade_produto1
    let produtos

    test.beforeAll(async ({ usuariosAPI, loginAPI }) => {

        const nome = faker.person.fullName()
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
        const { _id } = await resposta_cadastro.json()
        id_cadastro = _id

        const resposta_login = await loginAPI.logar(email, senha)
        const body_login = await resposta_login.json()
        authorization = body_login.authorization
    })

    test.beforeEach(async ({ produtosAPI, carrinhosAPI }) => {

        quantidade_produto1 = faker.number.int({ min: 1, max: 100 })
        const resposta_cadastro_produto1 = await produtosAPI.cadastrar(faker.commerce.productName(), faker.number.int({ min: 1, max: 100 }), faker.commerce.productDescription(), quantidade_produto1, authorization)
        const { _id: idProduto1 } = await resposta_cadastro_produto1.json()
        id_produto1 = idProduto1

        const quantidade_produto2 = faker.number.int({ min: 1, max: 100 })
        const resposta_cadastro_produto2 = await produtosAPI.cadastrar(faker.commerce.productName(), faker.number.int({ min: 1, max: 100 }), faker.commerce.productDescription(), quantidade_produto2, authorization)
        const { _id: idProduto2 } = await resposta_cadastro_produto2.json()
        id_produto2 = idProduto2

        produtos = [
            { idProduto: id_produto1, quantidade: quantidade_produto1 },
            { idProduto: id_produto2, quantidade: quantidade_produto2 }
        ]

        await carrinhosAPI.cadastrar(produtos, authorization)

    })

    const cenarios_sucesso = [
        { metodo: 'cancelar_compra', resposta: "Registro excluído com sucesso. Estoque dos produtos reabastecido" },
        { metodo: 'concluir_compra', resposta: "Registro excluído com sucesso" }
    ]

    cenarios_sucesso.forEach((cenario) => {
        test(`Deletar carrinho com método ${cenario.metodo} com sucesso @smoke`, async ({ carrinhosAPI }) => {
            const resposta_delete = await carrinhosAPI[cenario.metodo](authorization)
            const { message } = await resposta_delete.json()

            expect(resposta_delete.status()).toBe(200)
            expect(message).toBe(cenario.resposta)
        })
    })


    const cenarios_token = [
        { metodo: 'cancelar_compra', token: 'inválido' },
        { metodo: 'cancelar_compra', token: undefined },
        { metodo: 'concluir_compra', token: 'inválido' },
        { metodo: 'concluir_compra', token: undefined }
    ]

    cenarios_token.forEach((cenario) => {
        test(`Delete de carrinho com ${cenario.metodo} e token ${cenario.token}`, async ({ carrinhosAPI }) => {
            const resposta_delete = await carrinhosAPI[cenario.metodo](cenario.token)
            const { message } = await resposta_delete.json()

            expect(resposta_delete.status()).toBe(401)
            expect(message).toBe("Token de acesso ausente, inválido, expirado ou usuário do token não existe mais")

            await carrinhosAPI[cenario.metodo](authorization)
        })
    })


    test.afterEach(async ({ produtosAPI, carrinhosAPI }) => {
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