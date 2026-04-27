import {
  accessCodeGetController,
  accessCodePostController
} from './controller.js'

export const accessCode = {
  plugin: {
    name: 'access-code',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...accessCodeGetController
        },
        {
          method: 'POST',
          path: '/',
          ...accessCodePostController
        }
      ])
    }
  }
}
