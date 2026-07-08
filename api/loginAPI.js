export class LoginAPI {

    constructor(request) {
        this.request = request;
        this.rota = '/login'
    }

    async logar(email, senha) {
        return await this.request.post(this.rota, {
            data: {
                email: email,
                password: senha
            }
        })
    }

    async logarComPayload(payload) {
        return await this.request.post(this.rota, {
            data: payload
        });
    }
}