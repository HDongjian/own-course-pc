export let api
export let web
export let fls
export let download
export let file

let href = location.href

if (href.indexOf('47.104.69.49') !== -1) {
  api = 'http://47.104.69.49'
  web = 'http://47.104.69.49'
  fls = 'http://47.104.69.49/'
  download = 'http://47.104.69.49'
  file = 'http://47.104.69.49/api/files'
} else if (href.indexOf('course.hdongyu') !== -1) {
  api = 'http://course.hdongyu.com'
  web = 'http://course.hdongyu.com'
  fls = 'http://course.hdongyu.com/'
  download = 'http://course.hdongyu.com'
  file = 'http://course.hdongyu.com/api/files'
} else {
  api = 'http://localhost:4006'
  // api = 'http://47.104.69.49/api'
  // api = 'http://localhost:3006/'
  web = 'http://localhost:4006'
  // fls = 'http://localhost:3006/'
  fls = 'http://47.104.69.49/'
  download = 'http://localhost:3006'
  // download = 'http://course.hdongyu.com'
  file = 'http://localhost:4006/api/files'
}
