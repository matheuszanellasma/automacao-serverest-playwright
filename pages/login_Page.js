export class Login_Page {

    constructor(page) {
        this.page = page
        this.rota = '/login'

        this.campo_email = page.locator('#email')
        this.campo_senha = page.locator('#password')
        this.botao_entrar = page.locator('[data-testid="entrar"]')
        this.botao_cadastrar = page.locator('[data-testid="cadastrar"]')

        this.titulo_login = page.getByRole('heading', { name: 'Login' })

        //botar na page home quando criar
        this.mensagem_bem_vindo = page.locator('h1')
        this.menu_superior = page.locator('nav')
        this.botao_logout = page.getByRole('button', { name: 'Logout' })
    }

    async acessar_login() {
        await this.page.goto(this.rota)
    }

    async logar_usuario(email, senha) {
        await this.acessar_login()
        await this.campo_email.fill(email)
        await this.campo_senha.fill(senha)
        await this.botao_entrar.click()
    }

    async ir_para_cadastro() {
        await this.acessar_login()
        await this.botao_cadastrar.click()
    }
}