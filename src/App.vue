<template>
  <v-app>
    <v-card elevation="2" style="margin: 5px" v-for="(item, index) in allData" v-bind:key="index">
      <v-card-title>{{ item.code }}</v-card-title>
      <v-card-subtitle>{{ getRealItemType(item.type) }}</v-card-subtitle>
      <v-card-text>
        <div v-for="msg in item.message" v-bind:key="msg">{{ msg }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="red" @click="deleteDate(item.code)">Delete</v-btn>
        <v-btn text color="blue" @click="handleOpenEdit(item.code)">Edit</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="addDialog" persistent>
      <v-card>
        <v-card-title>新增</v-card-title>
        <v-card-text>
          <v-form ref="addForm" lazy-validation>
            <v-radio-group v-model="addForm.type" row>
              <v-radio label="文件/文件夹" value="1"></v-radio>
              <v-radio label="Shell脚本" value="2"></v-radio>
              <v-radio label="传入参数" value="3"></v-radio>
            </v-radio-group>
            <v-text-field
                v-model="addForm.code"
                :rules="codeRules"
                label="关键字"
                required
            ></v-text-field>
            <v-textarea
                label="文件资源"
                v-model="addForm.message"
                :rules="messageRules"
                required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="red" @click="handleCloseAdd()">取消</v-btn>
          <v-btn text color="blue" @click="handleAddSubmit()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="updateDialog" persistent>
      <v-card>
        <v-card-title>编辑</v-card-title>
        <v-card-text>
          <v-form ref="updateForm" lazy-validation>
            <v-radio-group v-model="updateForm.type" row>
              <v-radio label="文件/文件夹" value="1"></v-radio>
              <v-radio label="Shell脚本" value="2"></v-radio>
              <v-radio label="传入参数" value="3"></v-radio>
            </v-radio-group>
            <v-text-field
                v-model="updateForm.code"
                :rules="codeRules"
                label="关键字"
                required
            ></v-text-field>
            <v-textarea
                label="文件资源"
                v-model="updateForm.message"
                :rules="messageRules"
                required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="red" @click="handleCloseUpdate()">取消</v-btn>
          <v-btn text color="blue" @click="handleUpdateSubmit()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="importExportDialog" persistent>
      <v-card>
        <v-card-title>{{ importExport.msg }}</v-card-title>
        <v-card-text>
          <v-textarea
              :label="importExport.label"
              v-model="importExport.message"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="blue" @click="handleCloseImpExp()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn v-if="importExport.msg === ''" class="mx-2" fab dark color="blue"
           style="position: fixed; bottom: 2rem; right: 1.5rem;"
           @click="handleOpenAdd()">
      <v-icon dark>mdi-plus</v-icon>
    </v-btn>
    <v-btn v-if="importExport.msg === '导入'" class="mx-2" fab dark color="blue"
           style="position: fixed; bottom: 2rem; right: 1.5rem;"
           @click="importConfigFromFile()">
      <v-icon dark>mdi-cloud-upload</v-icon>
    </v-btn>
    <v-btn v-if="importExport.msg === '导出'" class="mx-2" fab dark color="blue"
           style="position: fixed; bottom: 2rem; right: 1.5rem;"
           @click="exportConfigToFile()">
      <v-icon dark>mdi-cloud-download</v-icon>
    </v-btn>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {},

  data: () => ({
    addDialog: false,
    updateDialog: false,
    importExportDialog: false,
    itemType: [
      '文件/文件夹',
      'Shell脚本',
      '传入参数'
    ],
    importExport: {
      msg: '',
      label: '',
      message: ''
    },
    allData: [],
    addForm: {
      code: '',
      message: '',
      type: ''
    },
    updateForm: {
      code: '',
      oriCode: '',
      message: '',
      type: '',
      rev: ''
    },
    codeRules: [
      v => !!v || '关键字必填'
    ],
    messageRules: [
      v => !!v || '文件资源必填'
    ],
  }),
  computed: {
    getRealItemType() {
      return function (type) {
        return this.itemType[Number(type) - 1]
      }
    }
  },
  watch: {},
  mounted() {
    window.mVue = this
  },
  methods: {
    handleCloseImpExp() {
      if (this.importExport.msg === '导入') {
        if (this.importExport.message !== '') {
          this.importData()
        }
      }
      this.importExportDialog = false
    },
    handleOpenAdd() {
      this.addDialog = true
      this.addForm.type = '1'
    },
    handleCloseAdd() {
      this.addDialog = false
      this.$refs.addForm.reset()
    },
    handleAddSubmit() {
      let flag = this.$refs.addForm.validate()
      if (flag) {
        if (utools.db.allDocs().find((val) => {
          return val.data.code === this.addForm.code
        })) {
          this.$message.error('keyword已存在')
          return
        }
        this.saveDataAfterCheck(this.addForm, 1)
        this.handleCloseAdd()
        this.initData()
      }
    },
    handleOpenEdit(code) {
      this.updateDialog = true
      let updateData = this.allData.find(v => {
        return v.code === code
      })
      Object.keys(this.updateForm).forEach(v => {
        this.updateForm[v] = updateData[v]
      })
      this.updateForm.oriCode = this.updateForm.code
      this.updateForm.message = this.updateForm.message.join('\n')
    },
    handleCloseUpdate() {
      this.updateDialog = false
      this.$refs.updateForm.reset()
    },
    handleUpdateSubmit() {
      let flag = this.$refs.updateForm.validate()
      if (flag) {
        if (this.updateForm.code != this.updateForm.oriCode && utools.db.allDocs().find((val) => {
          return val.data.code === this.addForm.code
        })) {
          this.$message.error('keyword已存在')
          return
        }
        this.saveDataAfterCheck(this.updateForm, 2)

        if (this.updateForm.code !== this.updateForm.oriCode) {
          utools.db.remove(this.updateForm.oriCode)
          utools.removeFeature(this.updateForm.oriCode)
        }

        this.handleCloseUpdate()
        this.initData()
      }
    },
    saveDataAfterCheck(webForm, type) {
      let data = {
        _id: webForm.code,
        data: {
          code: webForm.code,
          message: typeof (webForm.message) === 'string' ? webForm.message.split('\n') : webForm.message,
          type: webForm.type
        }
      }
      if (type === 2) {
        if (webForm.code === webForm.oriCode) {
          data._rev = webForm.rev
        }
        utools.removeFeature(this.updateForm.code)
      }
      utools.db.put(data)
      let explain
      switch (webForm.type) {
        case '1':
          explain = '打开 ' + webForm.code + ' 文件/文件夹'
          break
        case '2':
          explain = '执行 ' + webForm.code + ' Shell脚本'
          break
        case '3':
          explain = '执行 ' + webForm.code + ' Bat脚本可传入参数'
          break
      }
      let cmdData = [webForm.code]
      if (webForm.type === '3') {
        cmdData = [
          {
            'type': 'over',
            'label': webForm.code
          }
        ]
      }
      utools.setFeature({
        "code": webForm.code,
        "explain": explain,
        "cmds": cmdData
      })
    },
    deleteDate(code) {
      utools.db.remove(code)
      utools.removeFeature(code)
      this.initData()
    },
    initData() {
      this.allData = []
      utools.db.allDocs().forEach(doc => {
        let message = doc.data.message
        if (typeof message === 'string') {
          message = message.split("\n")
        }
        this.allData.push({
          id: doc._id,
          code: doc.data.code,
          message: message,
          type: doc.data.type,
          rev: doc._rev
        })
      })
      this.allData.sort(function (a, b) {
        return a.id.toString().localeCompare(b.toString())
      })
    },
    importConfigFromFile() {
      this.importExportDialog = true
      this.importExport.msg = '导入'
      this.importExport.label = '请粘贴JSON格式数据到此处'
      this.importExport.message = ''
    },
    importData() {
      let data
      try {
        data = JSON.parse(this.importExport.message)
      } catch (e) {
        data = []
        this.$message.error('JSON格式错误')
      }
      data.forEach(v => {
        if (utools.db.allDocs().find((val) => {
          return val.data.code === v.code
        })) {

        } else {
          this.saveDataAfterCheck(v, 3)
        }
      })
      this.initData()
    },
    exportConfigToFile() {
      this.importExportDialog = true
      this.importExport.msg = '导出'
      this.importExport.label = 'JSON数据'
      this.importExport.message = ''
      this.initData()
      if (this.allData.length > 0) {
        this.importExport.message = JSON.stringify(this.allData)
      }
    }
  }
}

utools.onPluginEnter(({code, type, payload, optional}) => {
  if (code === 'quickOpenSetting') {
    mVue.initData()
    mVue.importExport.msg = ''
  } else if (code === 'quickOpenExport') {
    mVue.initData()
    mVue.exportConfigToFile()
  } else if (code === 'quickOpenImport') {
    mVue.initData()
    mVue.importConfigFromFile()
  } else {
    let result = utools.db.get(code)
    let message = result.data.message
    if (typeof message === 'string') {
      message = message.split('\n')
    }
    utools.hideMainWindow()
    switch (result.data.type) {
      case '1':
        window.openItem(message)
        break
      case '2':
        message.forEach(v => {
          window.runBat(v)
        })
        utools.outPlugin()
        break
      case '3':
        if (type == 'over') {
          window.runBatArgs(message, payload)
        }
        utools.outPlugin()
        break
    }
  }
})
</script>
<style>
::-webkit-scrollbar {
  display: none;
}
</style>
