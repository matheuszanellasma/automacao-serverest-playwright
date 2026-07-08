export class Produtos_cadastroPage {

    constructor(page) {
        this.page = page
        this.rota = '/admin/cadastrarprodutos'

        this.campo_nome = page.locator('#nome')
        this.campo_preco = page.locator('#price')
        this.campo_descricao = page.locator('#description')
        this.campo_quantidade = page.locator('#quantity')
        this.botao_imagem = page.locator('#imagem')
        this.botao_cadastrar = page.locator('[data-testid="cadastarProdutos"]')

       
    }



    async acessar_cadastro_produto() {
        await this.page.goto(this.rota)
        await this.botao_cadastrar.waitFor({ state: 'visible' });


    }

    async enviar_imagem(caminho_arquivo) {
        await this.botao_imagem.setInputFiles(caminho_arquivo)
    }


    async cadastrar_produto(nome, preco, descricao, quantidade, imagem) {
        await this.acessar_cadastro_produto()

        await this.campo_nome.fill(nome)
        await this.campo_preco.fill(preco.toString())
        await this.campo_descricao.fill(descricao)
        await this.campo_quantidade.fill(quantidade.toString())
        await this.enviar_imagem(imagem)

        await this.botao_cadastrar.click()
        await this.page.waitForLoadState('networkidle')
    }

    async injetar_autenticacao({ email, nome, senha, authorization }) {

        await this.page.addInitScript((dados) => {
            localStorage.setItem('serverest/userEmail', dados.email)
            localStorage.setItem('serverest/userNome', dados.nome)
            localStorage.setItem('serverest/userPassword', dados.senha)
            localStorage.setItem('serverest/userToken', dados.authorization)
        }, { email, nome, senha, authorization })

    }
}