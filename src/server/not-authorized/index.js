import { notAuthorizedController } from './controller.js'

export const notAuthorized = {
  plugin: {
    name: 'not-authorized',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/not-authorized',
          ...notAuthorizedController
        }
      ])
    }
  }
}
