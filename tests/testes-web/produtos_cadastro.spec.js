import { faker } from "@faker-js/faker";
import { test, expect } from '../../support/baseTest'


test.describe('Suíte de testes da página de cadastro de produtos - ADM', () => {

    let id_cadastro
    let authorization
    let nome_produto
    let preco_produto
    let descricao_produto
    let quantidade_produto
    const caminho_imagem = "tests/fixtures/monitor.jfif"
    const nome = faker.person.fullName()
    const email = faker.internet.email()
    const senha = faker.internet.password()

    test.beforeAll(async ({ usuariosAPI, loginAPI }) => {
        const resposta_cadastro = await usuariosAPI.cadastrar(nome, email, senha, 'true')
            ; ({ _id: id_cadastro } = await resposta_cadastro.json())
        const resposta_login = await loginAPI.logar(email, senha)
            ; ({ authorization } = await resposta_login.json())
    })

    test.beforeEach(async ({ produtos_cadastroPage }) => {
        await produtos_cadastroPage.injetar_autenticacao({ email, nome, senha, authorization })
        nome_produto = faker.commerce.productName()
        preco_produto = faker.number.int({ min: 1, max: 100 })
        descricao_produto = faker.commerce.productDescription()
        quantidade_produto = faker.number.int({ min: 1, max: 100 })
    })


    test('Cadastro de produto com sucesso @smoke', async ({ produtos_cadastroPage, page, produtosAPI, produtos_listaPage }) => {
        await produtos_cadastroPage.cadastrar_produto(nome_produto, preco_produto, descricao_produto, quantidade_produto, caminho_imagem)

        await page.waitForURL('**/admin/listarprodutos')
        await expect(produtos_listaPage.titulo_listar_produtos).toBeVisible()
        await expect(page.getByText(nome_produto)).toBeVisible()

        const id_produto = await produtosAPI.buscar_id_produto_por_nome(nome_produto)
        const resposta_delete_produto = await produtosAPI.deletar(id_produto, authorization)
        expect(resposta_delete_produto.status()).toBe(200)

    })

    test('Cadastro de produto com nome repetido', async ({ produtos_cadastroPage, page, produtosAPI }) => {
        await produtos_cadastroPage.cadastrar_produto(nome_produto, preco_produto, descricao_produto, quantidade_produto, caminho_imagem)

        await page.waitForURL('**/admin/listarprodutos')
        await produtos_cadastroPage.cadastrar_produto(nome_produto, preco_produto, descricao_produto, quantidade_produto, caminho_imagem)


        await expect(page.getByText('Já existe produto com esse nome')).toBeVisible()

        const id_produto = await produtosAPI.buscar_id_produto_por_nome(nome_produto)
        const resposta_delete_produto = await produtosAPI.deletar(id_produto, authorization)
        expect(resposta_delete_produto.status()).toBe(200)

    })


    const cenarios_validacao_produto = [
        { teste: 'nome vazio', nome: '', preco: faker.number.int({ min: 1, max: 100 }), descricao: faker.commerce.productDescription(), quantidade: faker.number.int({ min: 1, max: 100 }), msg_erro: 'Nome é obrigatório'},
        { teste: 'preço vazio', nome: faker.commerce.productName(), preco: '', descricao: faker.commerce.productDescription(), quantidade: faker.number.int({ min: 1, max: 100 }), msg_erro: 'Preco é obrigatório'},
        { teste: 'descrição vazia', nome: faker.commerce.productName(), preco: faker.number.int({ min: 1, max: 100 }), descricao: '', quantidade: faker.number.int({ min: 1, max: 100 }), msg_erro: 'Descricao é obrigatório'},
        { teste: 'quantidade vazia', nome: faker.commerce.productName(), preco: faker.number.int({ min: 1, max: 100 }), descricao: faker.commerce.productDescription(), quantidade: '', msg_erro: 'Quantidade é obrigatório'}
    ]

    cenarios_validacao_produto.forEach((cenario)=>{

        test(`Validação de campos de cadastro de produto com ${cenario.teste}`, async({page, produtos_cadastroPage })=>{
            await produtos_cadastroPage.cadastrar_produto(cenario.nome, cenario.preco, cenario.descricao, cenario.quantidade, caminho_imagem)
            await expect(page.getByText(cenario.msg_erro)).toBeVisible()
        })
    })


    test.afterAll(async ({ usuariosAPI }) => {
        const resposta_delete_cadastro_usuario = await usuariosAPI.deletar(id_cadastro)
        expect(resposta_delete_cadastro_usuario.status()).toBe(200)
    })


})
