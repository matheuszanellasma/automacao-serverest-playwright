export class ProdutosAPI {

    constructor(request) {
        this.request = request,
            this.rota = "/produtos"
    }

    async deletar(id, token) {
        return await this.request.delete(`${this.rota}/${id}`, {
            headers: {
                Authorization: token
            }
        });
    }

    async cadastrar(nome, preco, descricao, quantidade, token) {
        return await this.request.post(this.rota, {
            headers: {
                Authorization: token
            },
            data: {
                nome,
                preco,
                descricao,
                quantidade
            }
        });
    }

    async buscar_id_produto_por_nome(nome) {
        const nomeCodificado = encodeURIComponent(nome);

        const resposta = await this.request.get(`${this.rota}?nome=${nomeCodificado}`)
        const { produtos } = await resposta.json()
        return produtos[0]._id
    }

}