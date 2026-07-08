export class UsuariosAPI {

    constructor(request) {
        this.request = request;
        this.rota = '/usuarios'
    }

    async cadastrar(nome, email, senha, admin) {
        return await this.request.post(this.rota, {
            data: {
                nome: nome,
                email: email,
                password: senha,
                administrador: admin
            }
        })
    }

    async cadastrarComPayload(payload) {
        return await this.request.post(this.rota, {
            data: payload
        });
    }

    async deletar(id) {
        return await this.request.delete(`${this.rota}/${id}`)
    }

    async buscar_id_por_email(email) {
        const resposta = await this.request.get(`${this.rota}?email=${email}`)
        const { usuarios } = await resposta.json()
        return usuarios[0]._id
    }
}