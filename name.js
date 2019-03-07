_wizard_view_name_index = params.views.findIndex(v => v.name === 'name')

ejs.renderFile(
  params.views[_wizard_view_name_index].ejs,
  Object.assign({
    viewIndex: _wizard_view_name_index
  }, params),
  { async: false },
  (_err, _str) => {
    document.getElementById('wizard_name').innerHTML = _str

    form_params.name = {}
    form_params.name.hostname = ''
    form_params.name._willShowErrors = null

    document.getElementById("wizard_name_form_hostname").addEventListener('input', nameHostnameChange);
  }
)

params.views[_wizard_view_name_index].isOk = function(willShowErrors){
  var _errors = []

  form_params.name.hostname = form_params.name.hostname.trim()

  if(form_params.name.hostname === ''){
    _errors[_errors.length] = { title: 'Device name', corpus: 'hsotname is empty'}
  }

  if(willShowErrors === true || _errors.length === 0){
    showErrors(_errors, params.views[_wizard_view_name_index].order)
  }

  if(_errors.length === 0){
    return true
  }
  return false
}

params.views[_wizard_view_name_index].getResumed = function(){
  var _html = ''
  if(form_params.name.ignore){
    _html =  `The name settings will be ignored`
  } else if(form_params.name.hostname){
    _html =  `Your ${params.device} will be renamed to <b>${form_params.name.hostname}</b>.`
  } else {
    _html =  `Your ${params.device} will not be renamed.`
  }
  return _html
}

params.views[_wizard_view_name_index].post = function(){
  var request = new Request(params.views[_wizard_view_name_index].api)

  var ok = params.views[_wizard_view_name_index].isOk()
  if(!ok){
    request.setData({})
  } else {
    request.setData({
      hostname: form_params.name.hostname
    })
  }
  return request.post()
}

params.views[_wizard_view_name_index].loaded = function(){
  var _flagsRequest = new Request(params.views[_wizard_view_name_index].api)
  return new Promise( (resolve, reject) => {
    _flagsRequest.get().then( flags => {
      if(flags.renamed === true){
        form_params.name.hostname = params.hostname
        document.getElementById("wizard_name_form_hostname").value = params.hostname
      }
      resolve()
    })
  })
}

params.views[_wizard_view_name_index].ignored = function(){
  requestAlive.setUrl(settingsWizardAliveApi)
}

params.views[_wizard_view_name_index].unIgnored = function(){
  if(form_params.name.hostname !== ''){
    requestAlive.setUrl(`http://${form_params.name.hostname}.local${settingsWizardAliveApi}`)
  } else {
    requestAlive.setUrl(settingsWizardAliveApi)
  }
}

function nameHostnameChange(e){
  form_params.name.hostname = document.getElementById('wizard_name_form_hostname').value
  if(form_params.name.hostname !== ''){
    requestAlive.setUrl(`http://${form_params.name.hostname}.local${settingsWizardAliveApi}`)
  } else {
    requestAlive.setUrl(settingsWizardAliveApi)
  }
  params.views[_wizard_view_name_index].checkButtonNextStats()
  if(form_params.name._willShowErrors){
    clearTimeout(form_params.name._willShowErrors)
  }
  form_params.name._willShowErrors = setTimeout(() => { params.views[_wizard_view_name_index].isOk(true) }, 3000)
}
