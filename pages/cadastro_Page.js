import { faker } from "@faker-js/faker"

export class Cadastro_Page {

    constructor(page) {
        this.page = page
        this.rota = '/cadastrarusuarios'

        this.campo_nome = page.locator('#nome')
        this.campo_email = page.locator('#email')
        this.campo_senha = page.locator('#password')
        this.check_administrador = page.locator('#administrador');
        this.botao_cadastrar = page.locator('[data-testid="cadastrar"]')
        this.botao_entrar = page.locator('[data-testid="entrar"]')
        this.titulo_cadastro = page.getByRole('heading', { name: 'Cadastro' })


        this.mensagem_email_duplicado = page.getByText('Este email já está sendo usado')

        //botar na page home quando criar
        this.mensagem_bem_vindo = page.locator('h1')
        this.menu_superior = page.locator('nav')
        this.botao_logout = page.getByRole('button', { name: 'Logout' })


    }

    async acessar_cadastro() {
        await this.page.goto(this.rota)
    }

    async ir_para_login() {
        await this.acessar_cadastro()
        await this.botao_entrar.click()
    }

    async cadastrar_usuario({
        nome = faker.person.fullName(),
        email = faker.internet.email(),
        senha = faker.internet.password(),
        admin = true
    } = {}) {
        await this.acessar_cadastro()
        await this.campo_nome.fill(nome)
        await this.campo_email.fill(email)
        await this.campo_senha.fill(senha)

        if (admin) {
            await this.check_administrador.check()
        } else {
            await this.check_administrador.uncheck()
        }

        await this.botao_cadastrar.click()
    }
}