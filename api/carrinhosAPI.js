export class CarrinhosAPI {

    constructor(request) {
        this.request = request
        this.rota = '/carrinhos'
    }

    async cancelar_compra(token) {
        return await this.request.delete(`${this.rota}/cancelar-compra`, {
            headers: {
                Authorization: token
            }
        })
    }

    async concluir_compra(token) {
        return await this.request.delete(`${this.rota}/concluir-compra`, {
            headers: {
                Authorization: token
            }
        })
    }

    async cadastrar(produtos, token) {
        return await this.request.post(this.rota, {
            headers: {
                Authorization: token
            },
            data: {
                produtos
            }
        })
    }
}