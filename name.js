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

    document.getElementById("wizard_name_form_hostname").addEventListener('input', nameHostnameChange);
    function nameHostnameChange(e){
      form_params.name.hostname = document.getElementById('wizard_name_form_hostname').value
      params.views[_wizard_view_name_index].checkButtonNextStats()
      if(form_params.name._willShowErrors){
        clearTimeout(form_params.name._willShowErrors)
      }
      form_params.name._willShowErrors = setTimeout(() => { params.views[_wizard_view_name_index].isOk(true) }, 3000)
    }
  }
)
