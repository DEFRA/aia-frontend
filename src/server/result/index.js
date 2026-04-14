import { resultController } from './controller.js'

/**
 * Sets up the routes used in the /result page.
 * These routes are registered in src/server/router.js.
 */
export const result = {
  plugin: {
    name: 'result',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/result',
          ...resultController
        }
      ])
    }
  }
}
