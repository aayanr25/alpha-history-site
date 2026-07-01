import { onRequestOptions as __api_verify_passcode_js_onRequestOptions } from "/Users/aayanr/dev/alpha-history-site/functions/api/verify-passcode.js"
import { onRequestPost as __api_verify_passcode_js_onRequestPost } from "/Users/aayanr/dev/alpha-history-site/functions/api/verify-passcode.js"
import { onRequest as __api_image_js_onRequest } from "/Users/aayanr/dev/alpha-history-site/functions/api/image.js"
import { onRequest as __api_photos_js_onRequest } from "/Users/aayanr/dev/alpha-history-site/functions/api/photos.js"
import { onRequest as __api_timeline_js_onRequest } from "/Users/aayanr/dev/alpha-history-site/functions/api/timeline.js"

export const routes = [
    {
      routePath: "/api/verify-passcode",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_verify_passcode_js_onRequestOptions],
    },
  {
      routePath: "/api/verify-passcode",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_verify_passcode_js_onRequestPost],
    },
  {
      routePath: "/api/image",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_image_js_onRequest],
    },
  {
      routePath: "/api/photos",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_photos_js_onRequest],
    },
  {
      routePath: "/api/timeline",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_timeline_js_onRequest],
    },
  ]