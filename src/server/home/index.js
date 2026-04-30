import {
  homeController,
  uploadController,
  pollStatusController
} from './controller.js'

export const home = {
  plugin: {
    name: 'home',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/home',
          ...homeController
        },
        {
          method: 'POST',
          path: '/upload',
          ...uploadController
        },
        {
          method: 'GET',
          path: '/api/poll-status',
          ...pollStatusController
        }
      ])
    }
  }
}
