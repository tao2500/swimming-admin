<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('姓名')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
    </div>

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
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('姓名')" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('电话')" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.telephone }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('人群')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.crowd }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('性别')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.gender }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('泳类')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('班级类型')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.classtype }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row, row.id, row.type)">
            {{ $t('录取') }}
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index,row.id)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
<!--    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />-->
    <!--  饿了么的对话框组件  这里用于展示 新增修改界面
           :title="textMap[dialogStatus]"  标题为下面声明的textMap数组中的dialogStatus key 的值
           :visible.sync="dialogFormVisible"   是否显示 Dialog 传入true展示 flase隐藏 这里界面初始化时为false 点击新增和修改时修改为true
           -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('姓名')" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item :label="$t('密码')" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item :label="$t('电话号')" prop="password">
          <el-input v-model="temp.telephone" />
        </el-form-item>
        <el-form-item :label="$t('项目')" prop="xiangmu">
          <el-input v-model="temp.xiangmu" />
        </el-form-item>
        <el-form-item :label="$t('人群')" prop="crowd">
          <el-select v-model="temp.crowd" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('性别')" prop="gender">
          <el-select v-model="temp.gender" class="filter-item" placeholder="Please select">
            <el-option v-for="item in genderOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('班级类')" prop="classtype">
          <el-select v-model="temp.classtype" class="filter-item" placeholder="Please select">
            <el-option v-for="item in classtypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('会员')" prop="huiyuan">
          <el-select v-model="temp.huiyuan" class="filter-item" placeholder="Please select">
            <el-option v-for="item in huiyuanOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('开卡日')">
          <el-date-picker v-model="temp.overtime" type="datetime" placeholder="请选择开卡日期" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click=createData()>
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <!--    对话框-->
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
import { fetchList, fetchPv, createArticle, deleteArticle } from '@/api/examine'
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
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      // 删除id临时存储
      delete: {
        id: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['儿童', '成人'],
      genderOptions: ['男', '女'],
      huiyuanOptions: ['大众周卡', '黄金月卡', '铂金季卡', '黑金年卡'],
      xiangmuOptions: ['自由泳', '蝶泳', '蛙泳', '仰泳', '花样游泳'],
      classtypeOptions: ['小班制', '私教'],
      showReviewer: false,
      temp: {
        id: undefined,
        password: '',
        crowd: '',
        gender: '',
        name: '',
        telephone: '',
        xiangmu: '',
        huiyuan: '',
        classtype: '',
        overtime: new Date() // 开卡时间(格林威治时间)，再根据会员类型转换为截止时间
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        password: [{ type: 'string', required: true, message: 'password is required', trigger: 'change' }],
        crowd: [{ type: 'string', required: true, message: 'crowd is required', trigger: 'change' }],
        gender: [{ type: 'string', required: true, message: 'gender is required', trigger: 'blur' }],
        name: [{ type: 'string', required: true, message: 'name is required', trigger: 'blur' }],
        classtype: [{ type: 'string', required: true, message: 'classType is required', trigger: 'blur' }],
        xiangmu: [{ type: 'string', required: true, message: 'xiangmu is required', trigger: 'blur' }]
        // huiyuan: [{ type: 'string', required: true, message: 'huiyuan is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.items
        this.total = response.total
        this.listLoading = false
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
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
    // 录取方法
    //  点击后弹出修改对话框
    handleUpdate(row, id, type) {
      // 将table中的row数据深拷贝到temp 中
      this.temp = Object.assign({}, row) // copy obj
      //  设置基础数据
      this.delete.id = id
      this.temp.xiangmu = type
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // 当下一次vue的dom元素更新时执行
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 删除方法
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.overtime = new Date()
          this.changeOverTime(this.temp)
          createArticle(this.temp).then(() => {
            // 删除相应数据
            this.handleDelete(this.row, 1, this.temp.id)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '添加学员成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 根据开卡时间算出结束时间
    changeOverTime(temp) {
      switch (temp.huiyuan) {
        case '大众周卡':
          this.temp.overtime = new Date(this.temp.overtime.setSeconds(this.temp.overtime.getSeconds() + 7 * 24 * 60 * 60))
          break
        case '黄金月卡':
          this.temp.overtime = new Date(this.temp.overtime.setMonth(this.temp.overtime.getMonth() + 1))
          break
        case '铂金季卡':
          this.temp.overtime = new Date(this.temp.overtime.setMonth(this.temp.overtime.getMonth() + 3))
          break
        case '黑金年卡':
          this.temp.overtime = new Date(this.temp.overtime.setMonth(this.temp.overtime.getMonth() + 12))
          break
        default : this.temp.overtime = new Date(this.temp.overtime.setMonth(this.temp.overtime.getMonth() + 1))
      }
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
