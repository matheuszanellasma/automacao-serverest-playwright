//procura o item, deleta para excluir e confirma exclusão
//  await page.locator('tr', { hasText: 'Monitor XTREME' }).locator('button.btn-danger').click();
//  await expect(page.locator('tr', { hasText: 'Monitor XTREME' })).toHaveCount(0);


export class Produtos_listaPage {

    constructor(page) {
        this.page = page
        this.rota = '/admin/listarprodutos'

        this.titulo_listar_produtos = page.getByRole('heading', { name: 'Lista dos Produtos' })
    }



    async acessar_lista_produto() {
        await this.page.goto(this.rota)
        await this.titulo_listar_produtos.waitFor({ state: 'visible' });
    }

    async obter_dados_produto_na_lista(nome) {
        const linha_produto = await this.obter_linha_produto(nome)
        const celulas = linha_produto.locator('td')
        return celulas
    }

    async obter_linha_produto(nome) {
        return this.page.locator('tr', { hasText: nome })
    }

    async excluir_produto(nome) {
        const linha_produto = this.page.locator('tr', { hasText: nome })
        const botao_excluir = linha_produto.locator('button', { hasText: 'Excluir' })
        await botao_excluir.click()
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