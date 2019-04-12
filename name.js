var VIEW_NAME = function() {
  var Name = function(options) {
    this.type = Name.type
    this.tab_name = this.type
    this.tab_id = `tab_${this.type}`
    this.navtab_id = `navtab_${this.type}`
    this.main_container_id = `wizard_${this.type}`
    this.index = modules.findIndex(m => m.type === this.type)
    this.params = Object.assign({}, params.views[this.index])
    this.lang = {}
    this.view = ''
    this.form = {}
  }

  Name.prototype = new VIEW;

  Name.prototype.load = function(){
    return new Promise( (resolve, reject) => {
      this.getLang()
      .then( (lang) => {
        this.lang = i18n.create({ values: lang })
        return this.getView()
      })
      .then( (view) => {
        var _html = ejs.render(view, { hostname: params.hostname, name: this.type, lang: this.lang })
        if(!_html){
          throw new Error(`cannot render ${this.params.ejs}`)
        } else {
          this.tab_name = this.lang('name')
          document.getElementById(this.navtab_id).innerHTML = this.tab_name
          document.getElementById(this.main_container_id).innerHTML = _html

          this.form = {}
          this.form.hostname = params.hostname
          this.form.ignore = true
          this.form._willShowErrors = null

          document.getElementById("wizard_name_form_hostname").addEventListener('input', (e) => { this.nameHostnameChange(e) });
          resolve()
        }
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  Name.prototype.isOk = function(willShowErrors){
    var _errors = []

    this.form.hostname = this.form.hostname.trim()

    if(this.form.hostname === ''){
      _errors[_errors.length] = { title: this.lang('isok_hostname_title'), corpus: this.lang('isok_hostname_corpus')}
    }

    if(willShowErrors === true || _errors.length === 0){
      this.showErrors(_errors)
    }

    if(_errors.length === 0){
      return true
    }
    return false
  }

  Name.prototype.nameHostnameChange = function(e){
    this.form.hostname = document.getElementById('wizard_name_form_hostname').value
    if(this.form.hostname !== '' && this.form.hostname !== params.hostname){
      delete this.form.ignore
      WIZARD.requestAlive.setUrl(`http://${this.form.hostname}.local${WIZARD.aliveApi}`)
    } else {
      this.form.ignore = true
      WIZARD.requestAlive.setUrl(WIZARD.aliveApi)
    }
    this.checkButtonNextStats()
    if(this.form._willShowErrors){
      clearTimeout(this.form._willShowErrors)
    }
    this.form._willShowErrors = setTimeout(() => { this.isOk(true) }, 3000)
  }

  Name.prototype.getResumed = function(){
    var _html = ''
    if(this.form.ignore || !this.form.hostname || this.form.hostname === params.hostname){
      _html =  this.lang('resume_not_renamed', { device: params.device })
    } else {
      _html =  this.lang('resume_rename', { device: params.device, hostname: this.form.hostname })
    }
    return _html
  }

  Name.prototype.post = function(){
    if(!this.isOk() || this.form.hostname === params.hostname){
      return new Promise( (resolve, reject) => { resolve(true) })
    } else {
      var request = new Request(this.params.api)
      request.setData({
        hostname: this.form.hostname
      })
      return request.post()
    }
  }

  Name.prototype.loaded = function(){
    var _flagsRequest = new Request(this.params.api)
    return new Promise( (resolve, reject) => {
      _flagsRequest.get().then( flags => {
        try{
          flags = JSON.parse(flags)
        } catch(e){}
        if(flags.renamed === true){
          this.form.ignore = true
          this.form.hostname = params.hostname
          document.getElementById("wizard_name_form_hostname").value = params.hostname
        }
        document.getElementById("wizard_name_form_hostname").nextElementSibling.classList.add('active')
        this.checkButtonNextStats()
        resolve()
      })
    })
  }

  Name.prototype.ignored = function(){
    WIZARD.requestAlive.setUrl(WIZARD.aliveApi)
  }

  Name.prototype.unIgnored = function(){
    if(this.form.hostname !== '' && this.form.hostname !== params.hostname){
      delete this.form.ignore
      WIZARD.requestAlive.setUrl(`http://${this.form.hostname}.local${WIZARD.aliveApi}`)
    } else {
      this.form.ignore = true
      WIZARD.requestAlive.setUrl(WIZARD.aliveApi)
    }
  }

  Name.type = 'name'

  return Name
}()

modules.push({type: VIEW_NAME.type, module: VIEW_NAME})
