<template>
  <ul :class="{'tree-grid-ul-list':listName, 'cl':listName,'tree-grid-hiden':listName?false:!treeData.down}">
    <li v-for="(tree,i ) in dealTreedata" :key="i" class="cl">
      <div class="tree-grid-list">
        <div :class="'fl p-l-'+tree.count*3" @click="down(tree,i)">
          <Icon class="icon" v-if="tree.children" :type="`ios-arrow-${tree.down?'down':'forward'}`" />
          {{ tree.title }}
        </div>
        <div class="fr action">
          <a @click="actions('modify',tree.count,tree)">编辑</a>
          <a @click="actions('delect',tree.count,tree)">删除</a>
          <a v-if="tree.count<2" @click="actions('add',tree.count,tree)">添加下一级</a>
        </div>
        <div class="fr b-r">
          <span>{{tree.description}}</span>
        </div>
      </div>
      <my-tree v-if="showTree&&tree.children&&tree.children.length" :treeData='tree'></my-tree>
    </li>
  </ul>
</template>

<script>
export default {
  data () {
    return {
      listName: false,
      downFlag: false,
      showTree: true
    }
  },
  props: {
    treeData: [Object, Array],
    loadData: { type: Function, default () {} }
  },
  computed: {
    dealTreedata () {
      if (this.listName) {
        return this.treeData
      } else {
        return this.treeData.children
      }
    }
  },
  created () {
    this.listName = this.$lib.isArray(this.treeData)
  },
  methods: {
    down (params, i) {
      this.dealTreedata[i].down = !this.dealTreedata[i].down
      this.$set(this.dealTreedata, i, this.dealTreedata[i])
      this.showTree = false
      setTimeout(() => {
        this.showTree = true
      }, 1)
      this.loadData(params, data => {
        this.$set(params, 'children', data)
      })
    },
    actions (k, c, tree) {
      var parent = this.$parent
      for (var i = 0; i < c - 1; i++) {
        parent = parent.$parent
      }
      parent.$emit('action', { key: k, data: tree })
    }
  }
}
</script>
