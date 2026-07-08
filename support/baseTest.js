// baseTest.js
import { test as base, expect, request } from '@playwright/test'
import { UsuariosAPI } from '../api/usuariosAPI'
import { LoginAPI } from '../api/loginAPI'
import { ProdutosAPI } from '../api/produtosAPI'
import { CarrinhosAPI } from '../api/carrinhosAPI'
import { Cadastro_Page } from '../pages/cadastro_Page'
import { Login_Page } from '../pages/login_Page'
import { Produtos_cadastroPage } from '../pages/produtos_cadastro_Page'
import { Produtos_listaPage } from '../pages/produtos_lista_Page'

const API_BASE_URL = 'https://serverest.dev'

export const test = base.extend({
    usuariosAPI: [async ({}, use) => {
        const apiContext = await request.newContext({ baseURL: API_BASE_URL })
        await use(new UsuariosAPI(apiContext))
        await apiContext.dispose()
    }, { scope: 'worker' }],

    loginAPI: [async ({}, use) => {
        const apiContext = await request.newContext({ baseURL: API_BASE_URL })
        await use(new LoginAPI(apiContext))
        await apiContext.dispose()
    }, { scope: 'worker' }],

    produtosAPI: [async ({}, use) => {
        const apiContext = await request.newContext({ baseURL: API_BASE_URL })
        await use(new ProdutosAPI(apiContext))
        await apiContext.dispose()
    }, { scope: 'worker' }],

    carrinhosAPI: [async ({}, use) => {
        const apiContext = await request.newContext({ baseURL: API_BASE_URL })
        await use(new CarrinhosAPI(apiContext))
        await apiContext.dispose()
    }, { scope: 'worker' }],

    cadastroPage: async ({ page }, use) => {
        await use(new Cadastro_Page(page))
    },

    loginPage: async ({ page }, use) => {
        await use(new Login_Page(page))
    },

    produtos_cadastroPage: async ({ page }, use) => {
        await use(new Produtos_cadastroPage(page))
    },

    produtos_listaPage: async ({ page }, use) => {
        await use(new Produtos_listaPage(page))
    }



})

export { expect }