import { faker } from '@faker-js/faker'
import { test, expect } from '../../support/baseTest'
import { UsuariosAPI } from '../../api/usuariosAPI'
import { LoginAPI } from '../../api/loginAPI'

test.describe('Suite de teste de Login - API (POST)', () => {

    test(`Login com credenciais válidas @smoke`, async ({ usuariosAPI, loginAPI }) => {
        const nome = faker.person.fullName()
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
        expect(resposta_cadastro.status()).toBe(201)
        const { _id } = await resposta_cadastro.json()

        const resposta_login = await loginAPI.logar(email, senha)
        expect(resposta_login.status()).toBe(200)
        const { message, authorization } = await resposta_login.json()

        expect(message).toBe("Login realizado com sucesso")
        expect(authorization).toBeTruthy()

        const resposta_delete = await usuariosAPI.deletar(_id)
        expect(resposta_delete.status()).toBe(200)
    })

    test(`Login com email não cadastrado`, async ({ loginAPI }) => {
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_login = await loginAPI.logar(email, senha)
        expect(resposta_login.status()).toBe(401)

        const { message } = await resposta_login.json()
        expect(message).toBe("Email e/ou senha inválidos")
    })

    test(`Login com senha errada`, async ({ loginAPI, usuariosAPI }) => {
        const nome = faker.person.fullName()
        const email = faker.internet.email()
        const senha = faker.internet.password()

        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
        expect(resposta_cadastro.status()).toBe(201)
        const { _id } = await resposta_cadastro.json()

        const resposta_login = await loginAPI.logar(email, 'senha_errada')
        expect(resposta_login.status()).toBe(401)

        const { message } = await resposta_login.json()
        expect(message).toBe("Email e/ou senha inválidos")

        const resposta_delete = await usuariosAPI.deletar(_id)
        expect(resposta_delete.status()).toBe(200)
    })

    test('Login com payload vazio', async ({ loginAPI }) => {
        const resposta_login = await loginAPI.logarComPayload({})
        expect(resposta_login.status()).toBe(400)

        const body_login = await resposta_login.json()
        expect(body_login).toEqual({
            email: "email é obrigatório",
            password: "password é obrigatório"
        });
    })

    const cenarios_validacao = [
        { teste: 'email vazio', email: '', senha: faker.internet.password(), erro: "email não pode ficar em branco", seletor: 'email' },
        { teste: 'senha vazia', email: faker.internet.email(), senha: '', erro: "password não pode ficar em branco", seletor: 'password' },
        { teste: 'email sem @', email: 'teste.com', senha: faker.internet.password(), erro: "email deve ser um email válido", seletor: 'email' },
        { teste: 'email sem domínio', email: 'teste@', senha: faker.internet.password(), erro: "email deve ser um email válido", seletor: 'email' }
    ]

    cenarios_validacao.forEach((cenario) => {
        test(`Validação de login com ${cenario.teste}`, async ({ loginAPI }) => {
            const resposta_login = await loginAPI.logar(cenario.email, cenario.senha)
            expect(resposta_login.status()).toBe(400)

            const body_login = await resposta_login.json()
            expect(body_login[cenario.seletor]).toBe(cenario.erro)
        })
    })
})