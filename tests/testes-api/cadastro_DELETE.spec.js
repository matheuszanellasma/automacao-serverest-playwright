import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { UsuariosAPI } from '../../api/usuariosAPI'
import { LoginAPI } from '../../api/loginAPI'
import { CarrinhosAPI } from '../../api/carrinhosAPI'


test.describe('Suite de teste de cadastro - API (DELETE)', () => {

    const tipos_cadastro = [
        { tipo: 'admin', admin: 'true' },
        { tipo: 'normal', admin: 'false' }
    ]

    tipos_cadastro.forEach((cadastro) => {
        test(`Delete de usuário ${cadastro.tipo} @smoke`, async ({ usuariosAPI }) => {

            const nome = faker.person.fullName()
            const email = faker.internet.email()
            const senha = faker.internet.password()

            const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, cadastro.admin)
            expect(resposta_cadastro.status()).toBe(201)
            const { _id } = await resposta_cadastro.json()

            const resposta_delete = await usuariosAPI.deletar(_id)
            expect(resposta_delete.status()).toBe(200)

            const { message } = await resposta_delete.json()
            expect(message).toBe("Registro excluído com sucesso")
        });
    })

    test(`Delete de usuário já deletado`, async ({ usuariosAPI }) => {
        const nome = faker.person.fullName()
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
        expect(resposta_cadastro.status()).toBe(201)
        const { _id } = await resposta_cadastro.json()

        const resposta_delete = await usuariosAPI.deletar(_id)
        expect(resposta_delete.status()).toBe(200)

        const resposta_segundo_delete = await usuariosAPI.deletar(_id)
        expect(resposta_segundo_delete.status()).toBe(200)

        const { message } = await resposta_segundo_delete.json()
        expect(message).toBe("Nenhum registro excluído")
    });

    test(`Deletar usuário com carrinho cadastrado`, async ({ loginAPI, carrinhosAPI, usuariosAPI, produtosAPI }) => {
        const nome = faker.person.fullName()
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
        const { _id: id_cadastro } = await resposta_cadastro.json()

        const resposta_login = await loginAPI.logar(email, senha)
        const { authorization } = await resposta_login.json()

        const quantidade_produto = faker.number.int({ min: 1, max: 100 })
        const resposta_cadastro_produto = await produtosAPI.cadastrar(faker.commerce.productName(),faker.number.int({ min: 1, max: 100 }), faker.commerce.productDescription(), quantidade_produto, authorization)
        const { _id: id_produto } = await resposta_cadastro_produto.json()

        const resposta_cadastrar_carrinho = await carrinhosAPI.cadastrar(
            [{ idProduto: id_produto, quantidade: quantidade_produto }],
            authorization
        )
        expect(resposta_cadastrar_carrinho.status()).toBe(201)

        const resposta_delete_com_carrinho = await usuariosAPI.deletar(id_cadastro)
        expect(resposta_delete_com_carrinho.status()).toBe(400)
        const { message: message_delete_com_carrinho } = await resposta_delete_com_carrinho.json()
        expect(message_delete_com_carrinho).toBe("Não é permitido excluir usuário com carrinho cadastrado")

        await carrinhosAPI.cancelar_compra(authorization)
        await produtosAPI.deletar(id_produto, authorization)

        const resposta_delete = await usuariosAPI.deletar(id_cadastro)
        expect(resposta_delete.status()).toBe(200)
        const { message: message_delete } = await resposta_delete.json()
        expect(message_delete).toBe("Registro excluído com sucesso")
    })

})

