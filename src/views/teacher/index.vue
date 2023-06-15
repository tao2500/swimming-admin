<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('密码') }}
      </el-checkbox>
    </div>
    <!-- v-loading 过渡效果 listLoading
                 data 遍历的数组
                 border 是否带有纵向边框
                 fit 列的宽度是否自撑开
                 @sort-change 当表格的排序条件发生变化的时候会触发该事件
            -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <!--      表单的列组件  label  显示的标题  prop  对应列内容的字段名  sortable 对应列是否可以排序  align 对齐方式-->
      <el-table-column :label="$t('id')" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('姓名')" prop="name" sortable="custom" align="center" width="80" :class-name="getSortClass('name')">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('项目')" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.item }}</span>
          <el-tag>{{ row.item | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('荣誉证书')" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.order }}</span>
          <el-tag>{{ row.order | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" :label="$t('密码')" width="110px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index,row.id)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
<!--    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />-->
    <!--  对话框组件  这里用于展示 新增修改界面
           :title="textMap[dialogStatus]"  标题为下面声明的textMap数组中的dialogStatus key 的值
           :visible.sync="dialogFormVisible"   是否显示 Dialog 传入true展示 flase隐藏 这里界面初始化时为false 点击新增和修改时修改为true
           -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <!-- ref  给表单起个别名dataForm 下面可以用this.$ref.dataForm获取表单dom
           rules设置表单数据校验规则为rules，rules在下面vue中声明  label-position标题对齐方式
       -->
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('姓名')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('项目')" prop="item">
          <el-input v-model="temp.item" />
        </el-form-item>
        <el-form-item :label="$t('证书')" prop="order">
          <el-input v-model="temp.order" />
        </el-form-item>
        <el-form-item :label="$t('密码')" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
<!--        取消-->
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
<!--        添加-->
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle, deleteArticle } from '@/api/teachers'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      //  获取的教练员列表
      list: null,
      // 大于0展示修改框
      total: 0,
      listLoading: true,
      // 搜索框请求数据及分页数据
      listQuery: {
        page: 1,
        limit: 20,
        type: undefined,
        sort: '+id'
      },
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: '+id' }, { label: '降序', key: '-id' }],
      // 根据复选框显示
      showReviewer: false,
      // 新增与修改界面使用的缓存数据
      temp: {
        id: undefined,
        name: '',
        password: '',
        item: '',
        order: ''
      },
      //  删除角色的id缓存
      delete: {
        id: undefined
      },
      // 对话框展示控制属性
      dialogFormVisible: false,
      dialogStatus: '',
      // 对话框标题数组
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      // 新增修改界面前端校验规则
      rules: {
        //  type 与上面form表单中的 prop一一对应  required是否必须 message 校验出错时提示的数据
        //  trigger: 'change' 当数据发现变化时触发校验   trigger: 'blur' 当失去焦点时触发校验
        name: [{ required: true, message: '姓名不能为空', trigger: 'change' }],
        password: [{ type: 'string', required: true, message: '密码不能为空', trigger: 'change' }],
        item: [{ required: true, message: '项目不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      // 将table设置 载入效果
      this.listLoading = true
      //  从后台请求数据
      fetchList(this.listQuery).then(response => {
        this.list = response.items
        console.log(this.list)
        // 设置分页参数
        this.total = response.total
        this.listLoading = false
      })
    },
    // 重新获取数据
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    //  改变排序方式
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    //  根据id排序
    sortByID(order) {
      if (order === 'ascending') {
        //  升序
        this.listQuery.sort = '+id'
      } else {
        //  降序
        this.listQuery.sort = '-id'
      }
      // 重新获取数据
      this.handleFilter()
    },
    // 重置temp缓存数据 在每次点击新增和修改时调用，避免数据出错
    resetTemp() {
      this.temp = {
        id: undefined,
        remark: '',
        title: '',
        status: 'published',
        type: ''
      }
    },
    // 点击新增按钮触发的方法  展示新增界面
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      // 当下一次vue的dom元素更新时执行
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 创建数据方法
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          //  设置基础数据  生成id
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // 到后端请求新增数据
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            // 将dialog对话框隐藏
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    //  点击后弹出修改对话框
    handleUpdate(row) {
      // 将table中的row数据深拷贝到temp 中
      this.temp = Object.assign({}, row) // copy obj
      //  设置基础数据
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // 当下一次vue的dom元素更新时执行
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 修改数据方法
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp) //  复制数据
          updateArticle(this.temp).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 触发删除事件
    handleDelete(row, index, id) {
      this.delete.id = id
      deleteArticle(this.delete).then(() => {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    // 阅读统计处理
    handleFetchPv(pv) {
      // 请求获取统计数据
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        // 设置统计模态框可见
        this.dialogPvVisible = true
      })
    },
    //  处理下载
    handleDownload() {
      this.downloadLoading = true
      // 导入Excel
      import('@/vendor/Export2Excel').then(excel => {
        // 设置Excel头部
        const tHeader = ['id', '姓名', '项目', '荣誉证书']
        // 过滤值
        const filterVal = ['id', 'name', 'item', 'order']
        // 表格数据格式化
        const data = this.formatJson(filterVal)
        // 导出json为Excel
        excel.export_json_to_excel({
          header: tHeader,
          data,
          //  导出文件名
          filename: 'teacher-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        return parseTime(v[j])
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
