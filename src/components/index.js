import MyTree from './MyTree.vue'
import AddCourse from './AddCourse.vue'
import ImageUploader from './ImageUploader.vue'
const components = {
  MyTree,
  AddCourse,
  ImageUploader
}

export default {
  install (Vue) {
    for (const name in components) {
      Vue.component(name, components[name])
    }
  }
}
