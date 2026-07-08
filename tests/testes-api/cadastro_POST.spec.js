import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { UsuariosAPI } from '../../api/usuariosAPI'


test.describe('Suite de teste de cadastro - API (POST)', () => {

    const tipos_cadastro = [
        { tipo: 'admin', admin: 'true' },
        { tipo: 'normal', admin: 'false' }
    ]

    tipos_cadastro.forEach((cadastro) => {
        test(`Cadastro ${cadastro.tipo} com credenciais válidas @smoke`, async ({ usuariosAPI }) => {

            const nome = faker.person.fullName()
            const email = faker.internet.email()
            const senha = faker.internet.password()

            const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, cadastro.admin)
            expect(resposta_cadastro.status()).toBe(201)

            const { message, _id } = await resposta_cadastro.json()
            expect(message).toBe("Cadastro realizado com sucesso")
            expect(_id).toBeTruthy()

            const resposta_delete = await usuariosAPI.deletar(_id)
            expect(resposta_delete.status()).toBe(200)

            const { message: message_delete } = await resposta_delete.json()
            expect(message_delete).toBe("Registro excluído com sucesso")

        });
    })

    test('Cadastro com email já cadastrado', async ({ usuariosAPI }) => {

        const email = faker.internet.email()
        const resposta_cadastro_inicial = await usuariosAPI.cadastrar(faker.person.fullName(), email, faker.internet.password(), 'true')
        const { _id: id_cadastro } = await resposta_cadastro_inicial.json()

        const resposta_cadastro = await usuariosAPI.cadastrar(faker.person.fullName(), email, faker.internet.password(), 'true')
        expect(resposta_cadastro.status()).toBe(400)

        const { message } = await resposta_cadastro.json()
        expect(message).toBe("Este email já está sendo usado")

        const resposta_delete = await usuariosAPI.deletar(id_cadastro)
        expect(resposta_delete.status()).toBe(200)
    })

    test('Cadastro com payload vazio', async ({ usuariosAPI }) => {
        const resposta_cadastro = await usuariosAPI.cadastrarComPayload({})
        expect(resposta_cadastro.status()).toBe(400)

        const body_cadastro = await resposta_cadastro.json()
        expect(body_cadastro).toEqual({
            nome: "nome é obrigatório",
            email: "email é obrigatório",
            password: "password é obrigatório",
            administrador: "administrador é obrigatório"
        });
    })

    const cenarios_validacao = [
        { teste: 'nome vazio', nome: '', email: faker.internet.email(), senha: faker.internet.password(), admin: "true", erro: "nome não pode ficar em branco", seletor: 'nome' },
        { teste: 'email vazio', nome: faker.person.fullName(), email: '', senha: faker.internet.password(), admin: "true", erro: "email não pode ficar em branco", seletor: 'email' },
        { teste: 'senha vazia', nome: faker.person.fullName(), email: faker.internet.email(), senha: '', admin: "true", erro: "password não pode ficar em branco", seletor: 'password' },
        { teste: 'admin vazio', nome: faker.person.fullName(), email: faker.internet.email(), senha: faker.internet.password(), admin: "", erro: "administrador deve ser 'true' ou 'false'", seletor: 'administrador' },
        { teste: 'email sem @', nome: faker.person.fullName(), email: 'teste.com', senha: faker.internet.password(), admin: "true", erro: "email deve ser um email válido", seletor: 'email' },
        { teste: 'email sem domínio', nome: faker.person.fullName(), email: 'teste@', senha: faker.internet.password(), admin: "true", erro: "email deve ser um email válido", seletor: 'email' }
    ]

    cenarios_validacao.forEach((cenario) => {
        test(`Validação de cadastro com ${cenario.teste}`, async ({ usuariosAPI }) => {
            const resposta_cadastro = await usuariosAPI.cadastrar(cenario.nome, cenario.email, cenario.senha, cenario.admin)
            expect(resposta_cadastro.status()).toBe(400)

            const body_cadastro = await resposta_cadastro.json()
            expect(body_cadastro[cenario.seletor]).toBe(cenario.erro)
        })
    })
})

